<?php

namespace App\Http\Controllers;

use App\Models\PayoutRequest;
use App\Models\Reward;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PayoutRequestController extends Controller
{
    /**
     * Show the participant payout page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $availableBalance = Reward::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->sum('amount');

        $rewardCounts = Reward::query()
            ->where('user_id', $user->id)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count,
                COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) as processing_count,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as paid_count
            ")
            ->first();

        $payoutRequests = PayoutRequest::query()
            ->where('user_id', $user->id)
            ->with([
                'payoutMethod:id,user_id,type,paypal_email',
                'rewards:id,campaign_id,amount,status,paid_at,payout_reference',
                'rewards.campaign:id,title',
            ])
            ->latest('requested_at')
            ->latest()
            ->get()
            ->map(fn (PayoutRequest $payoutRequest) => [
                'id' => $payoutRequest->id,
                'amount' => $payoutRequest->amount,
                'status' => $payoutRequest->status,
                'requested_at' => $payoutRequest->requested_at?->toDateTimeString(),
                'processed_at' => $payoutRequest->processed_at?->toDateTimeString(),
                'paid_at' => $payoutRequest->paid_at?->toDateTimeString(),
                'payout_reference' => $payoutRequest->payout_reference,
                'admin_notes' => $payoutRequest->admin_notes,
                'rejection_reason' => $payoutRequest->rejection_reason,
                'paypal_email' => $payoutRequest->payoutMethod?->paypal_email,
                'rewards' => $payoutRequest->rewards->map(fn (Reward $reward) => [
                    'id' => $reward->id,
                    'amount' => $reward->amount,
                    'status' => $reward->status,
                    'campaign_title' => $reward->campaign?->title,
                ])->values(),
            ]);

        return Inertia::render('Payouts/Index', [
            'stats' => [
                'available_balance' => (int) $availableBalance,
                'pending_rewards_count' => (int) $rewardCounts->pending_count,
                'processing_rewards_count' => (int) $rewardCounts->processing_count,
                'paid_rewards_count' => (int) $rewardCounts->paid_count,
            ],
            'payoutMethod' => $user->payoutMethod
                ? [
                    'type' => $user->payoutMethod->type,
                    'paypal_email' => $user->payoutMethod->paypal_email,
                ]
                : null,
            'payoutRequests' => $payoutRequests,
        ]);
    }

    /**
     * Request payout for all eligible pending rewards.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $payoutMethod = $user->payoutMethod;

        if (! $payoutMethod?->paypal_email) {
            return back()->with('error', 'Save a PayPal email before requesting a payout.');
        }

        $created = DB::transaction(function () use ($user, $payoutMethod) {
            $eligibleRewards = Reward::query()
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->lockForUpdate()
                ->get();

            if ($eligibleRewards->isEmpty()) {
                return null;
            }

            $payoutRequest = PayoutRequest::create([
                'user_id' => $user->id,
                'payout_method_id' => $payoutMethod->id,
                'amount' => (int) $eligibleRewards->sum('amount'),
                'status' => 'pending',
                'requested_at' => now(),
            ]);

            $payoutRequest->rewards()->attach($eligibleRewards->pluck('id'));

            Reward::query()
                ->whereIn('id', $eligibleRewards->pluck('id'))
                ->update([
                    'status' => 'processing',
                    'paid_at' => null,
                    'payout_reference' => null,
                ]);

            return $payoutRequest;
        });

        if (! $created) {
            return back()->with('error', 'There are no pending rewards available for payout right now.');
        }

        return back()->with('success', 'Payout request submitted.');
    }
}
