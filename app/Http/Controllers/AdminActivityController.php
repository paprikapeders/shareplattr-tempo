<?php

namespace App\Http\Controllers;

use App\Models\BlockedActivity;
use App\Models\Click;
use Inertia\Inertia;

class AdminActivityController extends Controller
{
    /**
     * Show blocked and flagged referral activity.
     */
    public function index()
    {
        $blockedActivities = BlockedActivity::query()
            ->with(['referralToken:id,token,user_id', 'user:id,name,email'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (BlockedActivity $activity) => [
                'id' => $activity->id,
                'type' => $activity->type,
                'referral_token' => $activity->referralToken?->token,
                'participant' => $activity->user
                    ? [
                        'name' => $activity->user->name,
                        'email' => $activity->user->email,
                    ]
                    : null,
                'ip_address' => $activity->ip_address,
                'reason' => $activity->reason,
                'created_at' => $activity->created_at->toDateTimeString(),
            ]);

        $flaggedClicks = Click::query()
            ->with(['referralToken:id,token,user_id', 'user:id,name,email'])
            ->where('is_flagged', true)
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Click $click) => [
                'id' => $click->id,
                'type' => 'flagged_click',
                'referral_token' => $click->referralToken?->token,
                'participant' => $click->user
                    ? [
                        'name' => $click->user->name,
                        'email' => $click->user->email,
                    ]
                    : null,
                'ip_address' => $click->ip_address,
                'reason' => $click->flag_reason,
                'created_at' => $click->created_at->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Activity/Index', [
            'blockedActivities' => $blockedActivities,
            'flaggedClicks' => $flaggedClicks,
        ]);
    }
}
