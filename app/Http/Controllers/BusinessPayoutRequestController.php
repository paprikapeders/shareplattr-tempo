<?php

namespace App\Http\Controllers;

use App\Models\PayoutRequest;
use App\Models\Reward;
use App\Services\StripeBillingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;

class BusinessPayoutRequestController extends Controller
{
    private const STATUSES = ['pending', 'approved', 'processing', 'paid', 'rejected', 'payment_failed'];

    public function __construct(private StripeBillingService $stripe)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $campaignIds = $user->ownedCampaigns()->pluck('id');

        $payoutRequests = PayoutRequest::query()
            ->whereHas('rewards', fn ($query) => $query->whereIn('campaign_id', $campaignIds))
            ->with([
                'user:id,name,email',
                'rewards:id,campaign_id,amount,status',
                'rewards.campaign:id,title,business_owner_id,brand_name',
            ])
            ->latest('requested_at')
            ->latest()
            ->get()
            ->map(fn (PayoutRequest $payoutRequest) => [
                'id' => $payoutRequest->id,
                'participant' => [
                    'name' => $payoutRequest->user->name,
                    'email' => $payoutRequest->user->email,
                ],
                'amount' => $payoutRequest->amount,
                'status' => $payoutRequest->status,
                'requested_at' => $payoutRequest->requested_at?->toDateTimeString(),
                'business_approved_at' => $payoutRequest->business_approved_at?->toDateTimeString(),
                'paid_at' => $payoutRequest->paid_at?->toDateTimeString(),
                'stripe_payment_status' => $payoutRequest->stripe_payment_status,
                'stripe_failure_reason' => $payoutRequest->stripe_failure_reason,
                'rewards_count' => $payoutRequest->rewards->count(),
                'campaigns' => $payoutRequest->rewards
                    ->map(fn (Reward $reward) => [
                        'id' => $reward->campaign?->id,
                        'title' => $reward->campaign?->title,
                        'brand_name' => $reward->campaign?->brand_name,
                    ])
                    ->unique('id')
                    ->values(),
            ]);

        $profile = $user->businessProfile;

        return Inertia::render('Business/PayoutRequests/Index', [
            'payoutRequests' => $payoutRequests,
            'billing' => [
                'ready' => (bool) $profile->stripe_billing_ready,
                'card_brand' => $profile->stripe_card_brand,
                'card_last4' => $profile->stripe_card_last4,
            ],
            'statuses' => self::STATUSES,
        ]);
    }

    public function approve(Request $request, PayoutRequest $payoutRequest): RedirectResponse
    {
        $user = $request->user();
        $profile = $user->businessProfile;

        if (! $profile->stripe_billing_ready || ! $profile->stripe_customer_id || ! $profile->stripe_payment_method_id) {
            return back()->with('error', 'Add a card before approving payout requests.');
        }

        $authorized = $this->businessOwnsPayoutRequest($payoutRequest, $user->id);
        abort_unless($authorized, 403);

        $freshRequest = PayoutRequest::query()->findOrFail($payoutRequest->id);

        if (! in_array($freshRequest->status, ['pending', 'payment_failed'], true) || $freshRequest->stripe_payment_intent_id) {
            return back()->with('error', 'This payout request is already being handled.');
        }

        try {
            $paymentIntent = $this->stripe->chargeSavedPaymentMethod($profile, $freshRequest);
        } catch (Throwable $exception) {
            $this->markPaymentFailed($freshRequest, $exception->getMessage());

            return back()->with('error', 'The saved card could not be charged. Check billing details and try again.');
        }

        DB::transaction(function () use ($freshRequest, $paymentIntent, $user) {
            $lockedRequest = PayoutRequest::query()
                ->whereKey($freshRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! in_array($lockedRequest->status, ['pending', 'payment_failed'], true) || $lockedRequest->stripe_payment_intent_id) {
                return;
            }

            $rewardIds = $lockedRequest->rewards()->pluck('rewards.id');

            $lockedRequest->update([
                'status' => 'approved',
                'processed_at' => now(),
                'business_approved_at' => now(),
                'business_approved_by' => $user->id,
                'stripe_payment_intent_id' => $paymentIntent['id'],
                'stripe_payment_status' => $paymentIntent['status'],
                'stripe_failure_reason' => null,
            ]);

            Reward::query()
                ->whereIn('id', $rewardIds)
                ->update(['status' => 'processing']);
        });

        return back()->with('success', 'Payout approved and business card charged.');
    }

    private function businessOwnsPayoutRequest(PayoutRequest $payoutRequest, int $businessOwnerId): bool
    {
        return $payoutRequest->rewards()->exists()
            && $payoutRequest->rewards()
            ->whereDoesntHave('campaign', fn ($query) => $query->where('business_owner_id', $businessOwnerId))
            ->doesntExist();
    }

    private function markPaymentFailed(PayoutRequest $payoutRequest, string $reason): void
    {
        $payoutRequest->update([
            'status' => 'payment_failed',
            'stripe_payment_status' => 'failed',
            'stripe_failure_reason' => str($reason)->limit(2000)->toString(),
        ]);
    }
}
