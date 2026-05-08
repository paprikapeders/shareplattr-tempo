<?php

namespace App\Http\Controllers;

use App\Models\WaitlistSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminWaitlistController extends Controller
{
    private const TYPES = ['referrer', 'business'];

    public function index(Request $request)
    {
        $type = $request->query('type');
        $type = in_array($type, self::TYPES, true) ? $type : null;
        $search = trim((string) $request->query('search', ''));

        $baseQuery = WaitlistSubmission::query()
            ->when($search !== '', fn ($query) => $query->where('email', 'like', '%'.$search.'%'));

        $counts = (clone $baseQuery)
            ->selectRaw('COUNT(*) as all_count')
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'referrer' THEN 1 ELSE 0 END), 0) as referrer_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'business' THEN 1 ELSE 0 END), 0) as business_count")
            ->first();

        $submissions = (clone $baseQuery)
            ->when($type, fn ($query) => $query->where('type', $type))
            ->latest()
            ->get()
            ->map(fn (WaitlistSubmission $submission) => [
                'id' => $submission->id,
                'email' => $submission->email,
                'type' => $submission->type,
                'source_page' => $submission->source_page,
                'created_at' => $submission->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Waitlist/Index', [
            'submissions' => $submissions,
            'filters' => [
                'type' => $type,
                'search' => $search,
            ],
            'counts' => [
                'all' => (int) $counts->all_count,
                'referrer' => (int) $counts->referrer_count,
                'business' => (int) $counts->business_count,
            ],
        ]);
    }
}
