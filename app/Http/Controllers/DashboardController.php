<?php

namespace App\Http\Controllers;

use App\Models\Click;
use App\Models\ReferralToken;
use App\Models\Reward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the participant dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $rewardSummaries = Reward::query()
            ->where('user_id', $user->id)
            ->selectRaw('campaign_id, COUNT(*) as conversions_count, COALESCE(SUM(amount), 0) as total_earned')
            ->groupBy('campaign_id')
            ->get()
            ->keyBy('campaign_id');

        $referralLinks = $user->referralTokens()
            ->with('campaign:id,brand_id,brand_name,title,slug,description,status,campaign_banner,updated_at')
            ->with('campaign.brand:id,name,logo')
            ->withCount('clicks')
            ->withCount('conversions')
            ->withCount([
                'clicks as unique_clicks_count' => fn ($query) => $query
                    ->where(function ($query) {
                        $query
                            ->whereNull('flag_reason')
                            ->orWhere('flag_reason', '!=', 'duplicate');
                    }),
            ])
            ->latest()
            ->get(['id', 'campaign_id', 'token', 'created_at'])
            ->map(function (ReferralToken $referralToken) use ($rewardSummaries) {
                $campaign = $referralToken->campaign;
                $rewardSummary = $rewardSummaries->get($referralToken->campaign_id);

                return [
                    'id' => $referralToken->id,
                    'campaign_id' => $campaign->id,
                    'campaign_slug' => $campaign->slug,
                    'campaign_title' => $campaign->title,
                    'campaign_description' => $campaign->description,
                    'campaign_status' => $campaign->status,
                    'campaign_banner' => $campaign->campaign_banner,
                    'campaign_banner_url' => $this->publicStorageUrl($campaign->campaign_banner, $campaign->updated_at?->timestamp),
                    'brand_name' => $campaign->brand?->name ?? $campaign->brand_name,
                    'brand_logo_url' => $campaign->brand?->logo ? Storage::disk('public')->url($campaign->brand->logo) : null,
                    'url' => route('referrals.show', $referralToken->token),
                    'clicks_count' => $referralToken->clicks_count,
                    'unique_clicks_count' => $referralToken->unique_clicks_count,
                    'conversions_count' => (int) ($rewardSummary?->conversions_count ?? $referralToken->conversions_count),
                    'total_earned' => (int) ($rewardSummary?->total_earned ?? 0),
                    'created_at' => $referralToken->created_at->toDateTimeString(),
                ];
            });

        $totalClicks = $referralLinks->sum('clicks_count');
        $uniqueClicks = $referralLinks->sum('unique_clicks_count');
        $totalConversions = $referralLinks->sum('conversions_count');
        $totalEarned = $referralLinks->sum('total_earned');

        $rewardTotals = Reward::query()
            ->where('user_id', $user->id)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_total,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_total
            ")
            ->first();

        $recentClicks = Click::query()
            ->where('user_id', $user->id)
            ->with('campaign:id,title')
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Click $click) => [
                'id' => 'click-'.$click->id,
                'title' => $click->campaign?->title ?? 'Campaign',
                'message' => 'A visitor clicked your referral link.',
                'timestamp' => $click->created_at->diffForHumans(),
                'sort_at' => $click->created_at->timestamp,
                'tone' => 'click',
            ]);

        $recentRewards = Reward::query()
            ->where('user_id', $user->id)
            ->with('campaign:id,title')
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Reward $reward) => [
                'id' => 'reward-'.$reward->id,
                'title' => $reward->campaign?->title ?? 'Campaign',
                'message' => 'Reward updated to '.ucfirst($reward->status).' for $'.number_format($reward->amount / 100, 2).'.',
                'timestamp' => $reward->created_at->diffForHumans(),
                'sort_at' => $reward->created_at->timestamp,
                'tone' => $reward->status,
            ]);

        $recentLinks = $referralLinks
            ->take(4)
            ->map(fn (array $link) => [
                'id' => 'link-'.$link['id'],
                'title' => $link['campaign_title'],
                'message' => 'Referral link generated and ready to share.',
                'timestamp' => \Carbon\Carbon::parse($link['created_at'])->diffForHumans(),
                'sort_at' => \Carbon\Carbon::parse($link['created_at'])->timestamp,
                'tone' => 'link',
            ]);

        $activities = $recentClicks
            ->concat($recentRewards)
            ->concat($recentLinks)
            ->sortByDesc(fn (array $activity) => $activity['sort_at'])
            ->take(8)
            ->map(function (array $activity) {
                unset($activity['sort_at']);

                return $activity;
            })
            ->values();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_conversions' => $totalConversions,
                'total_clicks' => $totalClicks,
                'unique_clicks' => $uniqueClicks,
                'total_earned' => $totalEarned,
                'active_campaigns' => $referralLinks->where('campaign_status', 'active')->count(),
                'pending_rewards' => (int) $rewardTotals->pending_total,
                'paid_rewards' => (int) $rewardTotals->paid_total,
            ],
            'referralLinks' => $referralLinks,
            'campaignPosts' => $referralLinks->map(fn (array $link) => [
                'id' => $link['id'],
                'campaign_id' => $link['campaign_id'],
                'campaign_slug' => $link['campaign_slug'],
                'username' => '@'.str($user->name)->lower()->replace(' ', ''),
                'title' => $link['campaign_title'],
                'content' => $link['campaign_description'] ?: 'Your active referral campaign is ready to share with your audience.',
                'thumbnail_url' => $link['campaign_banner_url'],
                'clicks_count' => $link['clicks_count'],
                'unique_clicks_count' => $link['unique_clicks_count'],
                'conversions_count' => $link['conversions_count'],
                'created_at' => $link['created_at'],
            ])->values(),
            'activities' => $activities,
            'payoutMethod' => $user->payoutMethod
                ? [
                    'type' => $user->payoutMethod->type,
                    'paypal_email' => $user->payoutMethod->paypal_email,
                    'verified_at' => $user->payoutMethod->verified_at?->toDateTimeString(),
                ]
                : null,
        ]);
    }

    private function publicStorageUrl(?string $path, ?int $version = null): ?string
    {
        if (! $path) {
            return null;
        }

        $url = Storage::disk('public')->url($path);

        if (! $version) {
            return $url;
        }

        return $url.(str_contains($url, '?') ? '&' : '?').'v='.$version;
    }
}
