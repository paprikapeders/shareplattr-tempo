<?php

namespace App\Http\Controllers;

use App\Models\Click;
use App\Models\PayoutRequest;
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
        $summary = $this->dashboardSummary($request);

        return Inertia::render('Dashboard', [
            'stats' => $summary['stats'],
            'referralLinks' => $summary['referralLinks'],
            'campaignPosts' => $summary['referralLinks']->map(fn (array $link) => [
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
            'activities' => $summary['activities'],
            'onboarding' => $summary['onboarding'],
        ]);
    }

    public function statsSummary(Request $request)
    {
        $summary = $this->dashboardSummary($request);

        return response()->json([
            'stats' => $summary['stats'],
            'referralLinks' => $summary['referralLinks']->values(),
            'activities' => $summary['activities'],
            'onboarding' => $summary['onboarding'],
        ]);
    }

    private function dashboardSummary(Request $request): array
    {
        $user = $request->user();
        $referralLinks = $this->referralLinks($user);
        $rewardTotals = Reward::query()
            ->where('user_id', $user->id)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_total,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_total
            ")
            ->first();
        $onboarding = $this->onboardingStatus($user, $referralLinks);

        return [
            'stats' => [
                'total_conversions' => $referralLinks->sum('conversions_count'),
                'total_clicks' => $referralLinks->sum('clicks_count'),
                'unique_clicks' => $referralLinks->sum('unique_clicks_count'),
                'total_earned' => $referralLinks->sum('total_earned'),
                'active_campaigns' => $referralLinks->where('campaign_status', 'active')->count(),
                'pending_rewards' => (int) $rewardTotals->pending_total,
                'paid_rewards' => (int) $rewardTotals->paid_total,
            ],
            'referralLinks' => $referralLinks,
            'activities' => $this->activities($user, $referralLinks),
            'onboarding' => $onboarding,
        ];
    }

    private function onboardingStatus($user, $referralLinks): array
    {
        $hasReferralToken = $referralLinks->isNotEmpty();
        $hasClick = Click::query()->where('user_id', $user->id)->exists();
        $hasReward = Reward::query()->where('user_id', $user->id)->exists();
        $hasPayoutRequest = PayoutRequest::query()->where('user_id', $user->id)->exists();
        $hasPayoutMethod = $user->payoutMethod()->exists();

        return [
            'show' => ! ($hasReferralToken || $hasClick || $hasReward || $hasPayoutRequest),
            'steps' => [
                [
                    'key' => 'browse_campaigns',
                    'label' => 'Browse campaigns',
                    'href' => route('campaigns.index'),
                    'completed' => false,
                ],
                [
                    'key' => 'join_first_campaign',
                    'label' => 'Join your first campaign / Generate your first referral link',
                    'href' => route('campaigns.index'),
                    'completed' => $hasReferralToken,
                ],
                [
                    'key' => 'add_payout_method',
                    'label' => 'Add your payout method',
                    'href' => route('payouts.index'),
                    'completed' => $hasPayoutMethod,
                ],
            ],
        ];
    }

    private function referralLinks($user)
    {
        $rewardSummaries = Reward::query()
            ->where('user_id', $user->id)
            ->selectRaw('campaign_id, COUNT(*) as conversions_count, COALESCE(SUM(amount), 0) as total_earned')
            ->groupBy('campaign_id')
            ->get()
            ->keyBy('campaign_id');

        return $user->referralTokens()
            ->with('campaign:id,brand_id,brand_name,title,slug,description,status,campaign_banner,updated_at')
            ->with('campaign.brand:id,name,logo')
            ->withCount('clicks')
            ->withCount('conversions')
            ->withCount([
                'clicks as unique_clicks_count' => fn ($query) => $query->where('is_flagged', false),
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
                    'clicks_count' => (int) $referralToken->clicks_count,
                    'unique_clicks_count' => (int) $referralToken->unique_clicks_count,
                    'conversions_count' => (int) ($rewardSummary?->conversions_count ?? $referralToken->conversions_count),
                    'total_earned' => (int) ($rewardSummary?->total_earned ?? 0),
                    'created_at' => $referralToken->created_at->toDateTimeString(),
                ];
            });
    }

    private function activities($user, $referralLinks)
    {
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

        return $recentClicks
            ->concat($recentRewards)
            ->concat($recentLinks)
            ->sortByDesc(fn (array $activity) => $activity['sort_at'])
            ->take(8)
            ->map(function (array $activity) {
                unset($activity['sort_at']);

                return $activity;
            })
            ->values();
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
