<?php

namespace App\Http\Controllers;

use App\Models\PayoutRequest;
use App\Models\Reward;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminPayoutRequestController extends Controller
{
    private const STATUSES = ['pending', 'processing', 'paid', 'rejected'];

    /**
     * Show payout requests for admin processing.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $status = in_array($status, self::STATUSES, true) ? $status : null;

        $counts = PayoutRequest::query()
            ->selectRaw('COUNT(*) as all_count')
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) as processing_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as paid_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected_count")
            ->first();

        $payoutRequests = PayoutRequest::query()
            ->with([
                'user:id,name,email',
                'payoutMethod:id,user_id,type,paypal_email',
                'rewards:id,campaign_id,amount,status',
                'rewards.campaign:id,title',
            ])
            ->when($status, fn ($query) => $query->where('status', $status))
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
                'processed_at' => $payoutRequest->processed_at?->toDateTimeString(),
                'paid_at' => $payoutRequest->paid_at?->toDateTimeString(),
                'payout_reference' => $payoutRequest->payout_reference,
                'admin_notes' => $payoutRequest->admin_notes,
                'rejection_reason' => $payoutRequest->rejection_reason,
                'payout_method' => $payoutRequest->payoutMethod
                    ? [
                        'type' => $payoutRequest->payoutMethod->type,
                        'paypal_email' => $payoutRequest->payoutMethod->paypal_email,
                    ]
                    : null,
                'rewards' => $payoutRequest->rewards->map(fn (Reward $reward) => [
                    'id' => $reward->id,
                    'amount' => $reward->amount,
                    'status' => $reward->status,
                    'campaign_title' => $reward->campaign?->title,
                ])->values(),
            ]);

        return Inertia::render('Admin/PayoutRequests/Index', [
            'payoutRequests' => $payoutRequests,
            'filters' => [
                'status' => $status,
            ],
            'counts' => [
                'all' => (int) $counts->all_count,
                'pending' => (int) $counts->pending_count,
                'processing' => (int) $counts->processing_count,
                'paid' => (int) $counts->paid_count,
                'rejected' => (int) $counts->rejected_count,
            ],
            'statuses' => self::STATUSES,
        ]);
    }

    /**
     * Mark a payout request as processing.
     */
    public function markProcessing(Request $request, PayoutRequest $payoutRequest): RedirectResponse
    {
        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($payoutRequest->status !== 'pending') {
            return back()->with('error', 'Only pending payout requests can be moved to processing.');
        }

        DB::transaction(function () use ($payoutRequest, $validated) {
            $rewardIds = $payoutRequest->rewards()->pluck('rewards.id');

            $payoutRequest->update([
                'status' => 'processing',
                'processed_at' => now(),
                'admin_notes' => $validated['admin_notes'] ?? $payoutRequest->admin_notes,
            ]);

            Reward::query()
                ->whereIn('id', $rewardIds)
                ->update([
                    'status' => 'processing',
                ]);
        });

        return back()->with('success', 'Payout request marked as processing.');
    }

    /**
     * Mark a payout request as paid.
     */
    public function markPaid(Request $request, PayoutRequest $payoutRequest): RedirectResponse
    {
        $validated = $request->validate([
            'payout_reference' => ['required', 'string', 'max:255'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        if (! in_array($payoutRequest->status, ['pending', 'processing'], true)) {
            return back()->with('error', 'Only pending or processing payout requests can be marked as paid.');
        }

        DB::transaction(function () use ($payoutRequest, $validated) {
            $timestamp = now();
            $rewardIds = $payoutRequest->rewards()->pluck('rewards.id');

            $payoutRequest->update([
                'status' => 'paid',
                'processed_at' => $payoutRequest->processed_at ?? $timestamp,
                'paid_at' => $timestamp,
                'payout_reference' => $validated['payout_reference'],
                'admin_notes' => $validated['admin_notes'] ?? $payoutRequest->admin_notes,
                'rejection_reason' => null,
            ]);

            Reward::query()
                ->whereIn('id', $rewardIds)
                ->update([
                    'status' => 'paid',
                    'paid_at' => $timestamp,
                    'payout_reference' => $validated['payout_reference'],
                ]);
        });

        return back()->with('success', 'Payout request marked as paid.');
    }

    /**
     * Reject a payout request and return rewards to pending.
     */
    public function reject(Request $request, PayoutRequest $payoutRequest): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:2000'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        if (! in_array($payoutRequest->status, ['pending', 'processing'], true)) {
            return back()->with('error', 'Only pending or processing payout requests can be rejected.');
        }

        DB::transaction(function () use ($payoutRequest, $validated) {
            $rewardIds = $payoutRequest->rewards()->pluck('rewards.id');

            $payoutRequest->update([
                'status' => 'rejected',
                'processed_at' => now(),
                'rejection_reason' => $validated['rejection_reason'],
                'admin_notes' => $validated['admin_notes'] ?? $payoutRequest->admin_notes,
                'paid_at' => null,
                'payout_reference' => null,
            ]);

            Reward::query()
                ->whereIn('id', $rewardIds)
                ->update([
                    'status' => 'pending',
                    'paid_at' => null,
                    'payout_reference' => null,
                ]);
        });

        return back()->with('success', 'Payout request rejected and rewards returned to pending.');
    }
}
