<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Reward;
use App\Models\Click;
use App\Support\Taxonomy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CampaignController extends Controller
{
    /**
     * Display active campaigns.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $search = preg_replace('/\s+/', ' ', trim((string) $request->query('search', ''))) ?? '';
        $category = (string) $request->query('category', 'all');
        $hasSearch = $search !== '';

        $campaignQuery = Campaign::query()
            ->with('brand:id,name,logo,logo_url,description,business_type,website_url,country_region,affiliate_url,contact_info,notes')
            ->with(['referralTokens' => fn ($query) => $query->where('user_id', $user->id)])
            ->withCount(['referralTokens', 'clicks', 'conversions'])
            ->available()
            ->when($category !== '' && $category !== 'all', function ($query) use ($category) {
                if (array_key_exists($category, Taxonomy::CAMPAIGN_CATEGORIES)) {
                    return $query->where(function ($query) use ($category) {
                        $query
                            ->where('category_key', $category)
                            ->orWhere(function ($query) use ($category) {
                                $query
                                    ->whereNull('category_key')
                                    ->where('category', Taxonomy::CAMPAIGN_CATEGORIES[$category]);
                            });
                    });
                }

                return $query->where('category', $category);
            });

        if ($hasSearch) {
            $normalizedSearch = strtolower($search);
            $like = '%'.$normalizedSearch.'%';
            $startsWith = $normalizedSearch.'%';

            $campaignQuery
                ->where(function ($query) use ($like) {
                    $query
                        ->whereRaw('LOWER(title) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(brand_name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(category) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(description) LIKE ?', [$like])
                        ->orWhereHas('brand', fn ($query) => $query->whereRaw('LOWER(name) LIKE ?', [$like]));
                })
                ->orderByRaw('CASE WHEN LOWER(title) = ? THEN 0 WHEN LOWER(title) LIKE ? THEN 1 ELSE 2 END', [
                    $normalizedSearch,
                    $startsWith,
                ])
                ->orderByDesc('id');
        } else {
            $campaignQuery->latest();
        }

        $campaigns = $campaignQuery
            ->get()
            ->map(fn (Campaign $campaign) => $this->campaignPayload($campaign));

        if (app()->environment(['local', 'development'])) {
            $exactTitleCampaigns = $search !== ''
                ? Campaign::query()
                    ->whereRaw('LOWER(title) = ?', [strtolower($search)])
                    ->get(['id', 'title', 'status', 'expires_at'])
                    ->map(fn (Campaign $campaign) => [
                        'id' => $campaign->id,
                        'title' => $campaign->title,
                        'status' => $campaign->status,
                        'expires_at' => $campaign->expires_at?->toDateTimeString(),
                        'included' => $campaigns->contains('id', $campaign->id),
                    ])
                    ->all()
                : [];

            Log::debug('Marketplace campaign search.', [
                'search' => $search,
                'category' => $category,
                'matched_campaigns' => $campaigns->count(),
                'matched_campaign_ids' => $campaigns->pluck('id')->all(),
                'matched_campaign_titles' => $campaigns->pluck('title')->all(),
                'exact_title_candidates' => $exactTitleCampaigns,
            ]);
        }

        $legacyCategories = Campaign::query()
            ->available()
            ->whereNull('category_key')
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->reject(fn (string $category) => in_array($category, Taxonomy::CAMPAIGN_CATEGORIES, true))
            ->map(fn (string $category) => ['value' => $category, 'label' => $category]);

        $categories = collect(Taxonomy::CAMPAIGN_CATEGORIES)
            ->map(fn (string $label, string $key) => ['value' => $key, 'label' => $label])
            ->values()
            ->merge($legacyCategories)
            ->values();

        return Inertia::render('Campaigns', [
            'campaigns' => $campaigns,
            'searchResults' => $hasSearch ? $campaigns : [],
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $category ?: 'all',
            ],
        ]);
    }

     /**
     * Display a single active campaign.
     */
    public function show(Request $request, string $campaign)
    {
        [$campaign, $wasResolvedById] = $this->resolveCampaign($campaign);

        abort_unless(
            $campaign && Campaign::query()->available()->whereKey($campaign->id)->exists(),
            404,
        );

        if ($wasResolvedById && $campaign->slug) {
            return redirect()->route('campaigns.show', $campaign->slug);
        }

        $campaign->load([
            'brand:id,name,logo,logo_url,description,business_type,website_url,country_region,affiliate_url,contact_info,notes',
            'referralTokens' => fn ($query) => $query->where('user_id', $request->user()->id),
        ]);
        $campaign->loadCount(['referralTokens', 'clicks', 'conversions']);

        return Inertia::render('Campaigns/Show', [
            'campaign' => $this->campaignPayload($campaign),
            'topPerformers' => $this->topPerformers($campaign),
        ]);
    }

    public function statsSummary(Request $request, string $campaign)
    {
        [$campaign] = $this->resolveCampaign($campaign);

        abort_unless(
            $campaign && Campaign::query()->available()->whereKey($campaign->id)->exists(),
            404,
        );

        $campaign->loadCount(['referralTokens', 'clicks', 'conversions']);

        $tokenIds = $request->user()
            ->referralTokens()
            ->where('campaign_id', $campaign->id)
            ->pluck('id');

        $participantClicks = Click::query()
            ->whereIn('referral_token_id', $tokenIds);

        $participantConversions = Reward::query()
            ->where('user_id', $request->user()->id)
            ->where('campaign_id', $campaign->id);

        return response()->json([
            'campaign_id' => $campaign->id,
            'campaign_click_count' => (int) $campaign->click_count,
            'click_count' => (int) $campaign->click_count,
            'conversion_count' => (int) ($campaign->conversions_count ?? 0),
            'participants_count' => (int) ($campaign->referral_tokens_count ?? 0),
            'participant_clicks_count' => (clone $participantClicks)->count(),
            'participant_unique_clicks_count' => (clone $participantClicks)->where('is_flagged', false)->count(),
            'participant_conversions_count' => (clone $participantConversions)->count(),
            'participant_total_earned' => (int) (clone $participantConversions)->sum('amount'),
            'source_breakdown' => $this->sourceBreakdown($campaign->id, $tokenIds->all()),
        ]);
    }

    private function campaignPayload(Campaign $campaign): array
    {
        $token = $campaign->referralTokens->first();

        return [
            'id' => $campaign->id,
            'slug' => $campaign->slug,
            'brand_name' => $campaign->brand?->name ?? $campaign->brand_name,
            'brand_logo_url' => $campaign->brand?->logo ? Storage::disk('public')->url($campaign->brand->logo) : $campaign->brand?->logo_url,
            'brand_industry' => $campaign->brand?->business_type,
            'brand_description' => $campaign->brand?->description,
            'brand_website_url' => $campaign->brand?->website_url,
            'brand_country_region' => $campaign->brand?->country_region,
            'title' => $campaign->title,
            'description' => $campaign->description,
            'category' => $campaign->category,
            'category_key' => $campaign->category_key,
            'category_other' => $campaign->category_other,
            'reward_type' => $campaign->reward_type ?? 'flat',
            'reward_amount' => $campaign->reward_amount,
            'reward_display' => $this->rewardDisplay($campaign),
            'commission_details' => $campaign->commission_details,
            'cookie_duration' => $campaign->cookie_duration,
            'network_platform' => $campaign->network_platform,
            'payout_details' => $campaign->payout_details,
            'requirements' => $campaign->requirements,
            'deliverables' => $campaign->deliverables,
            'tags' => $campaign->tags ?? [],
            'assets' => $campaign->assets ?? [],
            'participant_instructions' => $campaign->participant_instructions,
            'status' => $campaign->status,
            'expires_at' => $campaign->expires_at?->toIso8601String(),
            'click_count' => (int) ($campaign->clicks_count ?? $campaign->click_count ?? 0),
            'conversion_count' => (int) ($campaign->conversions_count ?? $campaign->conversion_count ?? 0),
            'participants_count' => (int) ($campaign->referral_tokens_count ?? 0),
            'destination_url' => $campaign->destination_url,
            'campaign_banner' => $campaign->campaign_banner,
            'campaign_banner_url' => $this->publicStorageUrl($campaign->campaign_banner, $campaign->updated_at?->timestamp),
            'referral_url' => $token ? route('referrals.show', $token->token) : null,
        ];
    }

    private function rewardDisplay(Campaign $campaign): string
    {
        if (($campaign->reward_type ?? 'flat') === 'percentage') {
            $percentage = rtrim(rtrim(number_format($campaign->reward_amount / 100, 2, '.', ''), '0'), '.');

            return $percentage.'%';
        }

        return '$'.number_format($campaign->reward_amount / 100, 2);
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

    private function resolveCampaign(string $value): array
    {
        $campaign = Campaign::query()->where('slug', $value)->first();

        if ($campaign) {
            return [$campaign, false];
        }

        if (ctype_digit($value)) {
            return [Campaign::query()->find($value), true];
        }

        return [null, false];
    }

    private function topPerformers(Campaign $campaign): array
    {
        $performers = Reward::query()
            ->where('campaign_id', $campaign->id)
            ->with('user:id,name')
            ->selectRaw('user_id, COALESCE(SUM(amount), 0) as total_earnings, COUNT(*) as conversions_count')
            ->groupBy('user_id')
            ->orderByDesc('total_earnings')
            ->orderByDesc('conversions_count')
            ->limit(3)
            ->get();

        $maxEarnings = max((int) ($performers->first()?->total_earnings ?? 0), 1);

        return $performers
            ->values()
            ->map(fn (Reward $performer, int $index) => [
                'rank' => $index + 1,
                'user_name' => $performer->user?->name ?? 'Participant',
                'initials' => $this->initials($performer->user?->name ?? 'Participant'),
                'total_earnings' => (int) $performer->total_earnings,
                'conversions_count' => (int) $performer->conversions_count,
                'bar_percent' => (int) round(((int) $performer->total_earnings / $maxEarnings) * 100),
            ])
            ->all();
    }

    private function sourceBreakdown(int $campaignId, array $tokenIds): array
    {
        if ($tokenIds === []) {
            return [];
        }

        return Click::query()
            ->where('campaign_id', $campaignId)
            ->whereIn('referral_token_id', $tokenIds)
            ->where('is_flagged', false)
            ->selectRaw("COALESCE(`source`, 'direct') as source, COUNT(*) as clicks")
            ->groupByRaw("COALESCE(`source`, 'direct')")
            ->orderByDesc('clicks')
            ->get()
            ->map(fn (Click $click) => [
                'source' => $click->source,
                'label' => str($click->source)->replace('_', ' ')->title()->toString(),
                'clicks' => (int) $click->clicks,
            ])
            ->all();
    }

    private function initials(string $name): string
    {
        return str($name)
            ->squish()
            ->explode(' ')
            ->take(2)
            ->map(fn (string $part) => str($part)->substr(0, 1)->upper())
            ->implode('') ?: 'SP';
    }
}
