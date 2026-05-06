<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRewardController extends Controller
{
    private const STATUSES = ['pending', 'processing', 'paid', 'rejected'];

    /**
     * Show rewards for manual payout review.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $status = in_array($status, self::STATUSES, true) ? $status : null;

        $counts = Reward::query()
            ->selectRaw('COUNT(*) as all_count')
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) as processing_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as paid_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected_count")
            ->first();

        $rewards = Reward::query()
            ->with(['campaign:id,title', 'user:id,name,email'])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->get()
            ->map(fn (Reward $reward) => [
                'id' => $reward->id,
                'participant' => [
                    'name' => $reward->user->name,
                    'email' => $reward->user->email,
                ],
                'campaign' => [
                    'title' => $reward->campaign->title,
                ],
                'amount' => $reward->amount,
                'status' => $reward->status,
                'payout_reference' => $reward->payout_reference,
                'created_at' => $reward->created_at->toDateTimeString(),
                'paid_at' => $reward->paid_at?->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Rewards/Index', [
            'rewards' => $rewards,
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
     * Mark a pending reward as manually paid.
     */
    public function markPaid(Request $request, Reward $reward): RedirectResponse
    {
        $validated = $request->validate([
            'payout_reference' => ['required', 'string', 'max:255'],
        ]);

        if ($reward->status !== 'pending') {
            return back()->with('error', 'Only pending rewards can be marked as paid.');
        }

        $reward->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payout_reference' => $validated['payout_reference'],
        ]);

        return back()->with('success', 'Reward marked as paid.');
    }
}
