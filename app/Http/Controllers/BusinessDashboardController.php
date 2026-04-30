<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Click;
use App\Models\Conversion;
use App\Models\Reward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BusinessDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $ownedCampaigns = Campaign::query()
            ->where('business_owner_id', $user->id)
            ->withCount([
                'clicks',
                'conversions',
                'clicks as unique_clicks_count' => fn ($query) => $query->where('is_flagged', false),
                'clicks as flagged_clicks_count' => fn ($query) => $query->where('is_flagged', true),
            ])
            ->withSum('rewards as rewards_generated', 'amount')
            ->withSum(['rewards as pending_rewards_generated' => fn ($query) => $query->where('status', 'pending')], 'amount')
            ->withSum(['rewards as paid_rewards_generated' => fn ($query) => $query->where('status', 'paid')], 'amount')
            ->latest()
            ->get();
        $campaignIds = $ownedCampaigns->pluck('id');
        $totalClicks = Click::query()->whereIn('campaign_id', $campaignIds)->count();
        $totalConversions = Conversion::query()->whereIn('campaign_id', $campaignIds)->count();
        $pendingRewards = Reward::query()->whereIn('campaign_id', $campaignIds)->where('status', 'pending')->sum('amount');
        $paidRewards = Reward::query()->whereIn('campaign_id', $campaignIds)->where('status', 'paid')->sum('amount');

        $campaignPerformance = $ownedCampaigns
            ->map(fn (Campaign $campaign) => $this->campaignPerformancePayload($campaign))
            ->values();

        $conversions = Conversion::query()
            ->whereIn('campaign_id', $campaignIds)
            ->with(['campaign:id,title,business_owner_id', 'user:id,name,email', 'reward:id,conversion_id,amount,status'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Conversion $conversion) => [
                'id' => $conversion->id,
                'campaign_title' => $conversion->campaign?->title,
                'participant_name' => $conversion->user?->name,
                'participant_email' => $conversion->user?->email,
                'amount' => $conversion->amount,
                'reward_created' => (bool) $conversion->reward,
                'reward_amount' => $conversion->reward?->amount,
                'reward_status' => $conversion->reward?->status,
                'status' => $conversion->status,
                'created_at' => $conversion->created_at->toDateTimeString(),
            ])
            ->values();

        $payoutLiabilities = Reward::query()
            ->whereIn('campaign_id', $campaignIds)
            ->with(['campaign:id,title,business_owner_id', 'user:id,name,email'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Reward $reward) => [
                'id' => $reward->id,
                'campaign_title' => $reward->campaign?->title,
                'participant_name' => $reward->user?->name,
                'participant_email' => $reward->user?->email,
                'pending_amount' => $reward->status === 'pending' ? $reward->amount : 0,
                'paid_amount' => $reward->status === 'paid' ? $reward->amount : 0,
                'amount' => $reward->amount,
                'total_amount' => $reward->amount,
                'status' => $reward->status,
                'created_at' => $reward->created_at->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('Business/Dashboard', [
            'profile' => [
                'company_name' => $user->businessProfile?->company_name,
            ],
            'stats' => [
                'total_campaigns' => $campaignIds->count(),
                'active_campaigns' => $ownedCampaigns->where('status', 'active')->count(),
                'total_clicks' => $totalClicks,
                'unique_clicks' => Click::query()->whereIn('campaign_id', $campaignIds)->where('is_flagged', false)->count(),
                'flagged_clicks' => Click::query()->whereIn('campaign_id', $campaignIds)->where('is_flagged', true)->count(),
                'total_conversions' => $totalConversions,
                'average_conversion_rate' => $totalClicks > 0 ? round(($totalConversions / $totalClicks) * 100, 2) : 0,
                'rewards_generated' => Reward::query()->whereIn('campaign_id', $campaignIds)->sum('amount'),
                'pending_payout_liability' => $pendingRewards,
                'paid_rewards' => $paidRewards,
            ],
            'campaignPerformance' => $campaignPerformance,
            'conversions' => $conversions,
            'payoutLiabilities' => $payoutLiabilities,
        ]);
    }

    private function campaignPerformancePayload(Campaign $campaign): array
    {
        $clicks = (int) ($campaign->clicks_count ?? 0);
        $conversions = (int) ($campaign->conversions_count ?? 0);

        return [
            'id' => $campaign->id,
            'title' => $campaign->title,
            'brand_name' => $campaign->brand_name,
            'category' => $campaign->category,
            'status' => $campaign->status,
            'banner_url' => $campaign->campaign_banner ? Storage::disk('public')->url($campaign->campaign_banner) : null,
            'clicks' => $clicks,
            'unique_clicks' => (int) ($campaign->unique_clicks_count ?? 0),
            'flagged_clicks' => (int) ($campaign->flagged_clicks_count ?? 0),
            'conversions' => $conversions,
            'conversion_rate' => $clicks > 0 ? round(($conversions / $clicks) * 100, 2) : 0,
            'reward_amount' => $campaign->reward_amount,
            'rewards_generated' => (int) ($campaign->rewards_generated ?? 0),
            'pending_rewards_generated' => (int) ($campaign->pending_rewards_generated ?? 0),
            'paid_rewards_generated' => (int) ($campaign->paid_rewards_generated ?? 0),
            'destination_url' => $campaign->destination_url,
            'created_at' => $campaign->created_at->toDateString(),
            'expires_at' => $campaign->expires_at?->toDateString(),
        ];
    }
}
