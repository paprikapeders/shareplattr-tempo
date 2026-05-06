<?php

namespace App\Http\Controllers;

use App\Models\PayoutRequest;
use App\Models\Reward;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPayoutRequestController extends Controller
{
    private const STATUSES = ['pending', 'approved', 'processing', 'paid', 'rejected', 'payment_failed'];

    /**
     * Show payout requests for admin tracking.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $status = in_array($status, self::STATUSES, true) ? $status : null;

        $counts = PayoutRequest::query()
            ->selectRaw('COUNT(*) as all_count')
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) as processing_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as paid_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'payment_failed' THEN 1 ELSE 0 END), 0) as payment_failed_count")
            ->first();

        $payoutRequests = PayoutRequest::query()
            ->with([
                'user:id,name,email',
                'rewards:id,campaign_id,amount,status',
                'rewards.campaign:id,title,brand_name,business_owner_id',
                'rewards.campaign.businessOwner:id,name,email',
                'businessApprover:id,name,email',
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
                'business_approved_at' => $payoutRequest->business_approved_at?->toDateTimeString(),
                'payout_reference' => $payoutRequest->payout_reference,
                'admin_notes' => $payoutRequest->admin_notes,
                'rejection_reason' => $payoutRequest->rejection_reason,
                'stripe_payment_intent_id' => $payoutRequest->stripe_payment_intent_id,
                'stripe_payment_status' => $payoutRequest->stripe_payment_status,
                'stripe_failure_reason' => $payoutRequest->stripe_failure_reason,
                'business_approver' => $payoutRequest->businessApprover
                    ? [
                        'name' => $payoutRequest->businessApprover->name,
                        'email' => $payoutRequest->businessApprover->email,
                    ]
                    : null,
                'businesses' => $payoutRequest->rewards
                    ->map(fn (Reward $reward) => [
                        'id' => $reward->campaign?->businessOwner?->id,
                        'name' => $reward->campaign?->brand_name ?? $reward->campaign?->businessOwner?->name,
                        'email' => $reward->campaign?->businessOwner?->email,
                    ])
                    ->unique('id')
                    ->values(),
                'rewards' => $payoutRequest->rewards->map(fn (Reward $reward) => [
                    'id' => $reward->id,
                    'amount' => $reward->amount,
                    'status' => $reward->status,
                    'campaign_title' => $reward->campaign?->title,
                    'business_name' => $reward->campaign?->brand_name,
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
                'approved' => (int) $counts->approved_count,
                'processing' => (int) $counts->processing_count,
                'paid' => (int) $counts->paid_count,
                'rejected' => (int) $counts->rejected_count,
                'payment_failed' => (int) $counts->payment_failed_count,
            ],
            'statuses' => self::STATUSES,
        ]);
    }
}
