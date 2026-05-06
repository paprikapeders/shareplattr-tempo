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
        abort_unless($user->isParticipant(), 403);

        $availableBalance = Reward::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->whereHas('conversion', fn ($query) => $query->where('status', 'verified'))
            ->whereDoesntHave('payoutRequests', fn ($query) => $query->whereNotIn('status', ['rejected', 'payment_failed']))
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
                'rewards:id,campaign_id,amount,status,paid_at,payout_reference',
                'rewards.campaign:id,title,brand_name',
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
                'business_approved_at' => $payoutRequest->business_approved_at?->toDateTimeString(),
                'stripe_payment_status' => $payoutRequest->stripe_payment_status,
                'rewards' => $payoutRequest->rewards->map(fn (Reward $reward) => [
                    'id' => $reward->id,
                    'amount' => $reward->amount,
                    'status' => $reward->status,
                    'campaign_title' => $reward->campaign?->title,
                    'brand_name' => $reward->campaign?->brand_name,
                ])->values(),
            ]);

        return Inertia::render('Payouts/Index', [
            'stats' => [
                'available_balance' => (int) $availableBalance,
                'pending_rewards_count' => (int) $rewardCounts->pending_count,
                'processing_rewards_count' => (int) $rewardCounts->processing_count,
                'paid_rewards_count' => (int) $rewardCounts->paid_count,
            ],
            'payoutRequests' => $payoutRequests,
        ]);
    }

    /**
     * Request payout for all eligible pending rewards.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isParticipant(), 403);

        $created = DB::transaction(function () use ($user) {
            $eligibleRewards = Reward::query()
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->whereHas('conversion', fn ($query) => $query->where('status', 'verified'))
                ->whereDoesntHave('payoutRequests', fn ($query) => $query->whereNotIn('status', ['rejected', 'payment_failed']))
                ->with('campaign:id,business_owner_id')
                ->lockForUpdate()
                ->get();

            if ($eligibleRewards->isEmpty()) {
                return 0;
            }

            $created = 0;

            foreach ($eligibleRewards->groupBy(fn (Reward $reward) => $reward->campaign?->business_owner_id ?: 'unassigned') as $rewards) {
                $payoutRequest = PayoutRequest::create([
                    'user_id' => $user->id,
                    'amount' => (int) $rewards->sum('amount'),
                    'status' => 'pending',
                    'requested_at' => now(),
                ]);

                $payoutRequest->rewards()->attach($rewards->pluck('id'));
                $created++;
            }

            Reward::query()
                ->whereIn('id', $eligibleRewards->pluck('id'))
                ->update([
                    'status' => 'processing',
                    'paid_at' => null,
                    'payout_reference' => null,
                ]);

            return $created;
        });

        if (! $created) {
            return back()->with('error', 'There are no pending rewards available for payout right now.');
        }

        return back()->with('success', $created === 1 ? 'Payout request submitted.' : 'Payout requests submitted.');
    }
}
