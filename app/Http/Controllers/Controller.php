<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\User;

abstract class Controller
{
    protected function businessSetupChecklist(User $user): array
    {
        $user->loadMissing('businessProfile');

        $profileComplete = $user->hasCompleteBusinessProfile();
        $billingComplete = (bool) $user->businessProfile?->stripe_billing_ready;
        $campaigns = Campaign::query()
            ->where('business_owner_id', $user->id)
            ->select(['id', 'status'])
            ->oldest()
            ->get();
        $hasCampaign = $campaigns->isNotEmpty();
        $hasActiveCampaign = $campaigns->contains('status', 'active');
        $firstCampaign = $campaigns->first();
        $nextCampaignToActivate = $campaigns->firstWhere('status', '!=', 'active') ?? $firstCampaign;

        $steps = [
            [
                'key' => 'profile',
                'label' => 'Complete Profile',
                'description' => 'Add your business details so campaigns look trustworthy.',
                'completed' => $profileComplete,
                'href' => route('business.profile.edit'),
            ],
            [
                'key' => 'billing',
                'label' => 'Add Billing',
                'description' => 'Set up billing before launching campaigns.',
                'completed' => $billingComplete,
                'href' => route('business.billing.edit'),
            ],
            [
                'key' => 'campaign',
                'label' => 'Create Campaign',
                'description' => 'Create your first campaign for participants to share.',
                'completed' => $hasCampaign,
                'href' => route('business.campaigns.create'),
            ],
            [
                'key' => 'go_live',
                'label' => 'Go Live',
                'description' => 'Activate your campaign when everything is ready.',
                'completed' => $hasActiveCampaign,
                'href' => $nextCampaignToActivate
                    ? route('business.campaigns.edit', $nextCampaignToActivate)
                    : route('business.campaigns.index'),
            ],
        ];

        $completedCount = collect($steps)->where('completed', true)->count();
        $allComplete = $completedCount === count($steps);

        return [
            'shouldShow' => $user->created_at?->greaterThanOrEqualTo(now()->subDays(7)) || ! $hasCampaign || ! $allComplete,
            'completedCount' => $completedCount,
            'totalCount' => count($steps),
            'steps' => $steps,
        ];
    }
}
