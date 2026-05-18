<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Reward;
use App\Models\Click;
use App\Support\Taxonomy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CampaignController extends Controller
{
    private const DEFAULT_SHARE_MESSAGE_TEMPLATE = "Hey! I've been using {business_name} and thought you'd love it.\n\nUse my link to get started: {referral_link}";

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
            ->available();

        $this->applyCategoryFilter($campaignQuery, $category);

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
                        ->orWhereRaw('LOWER(category_other) LIKE ?', [$like])
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

        return Inertia::render('Campaigns', [
            'campaigns' => $campaigns,
            'searchResults' => $hasSearch ? $campaigns : [],
            'categories' => $this->categoryOptions(),
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

        $payoutMethod = $request->user()->payoutMethod;

        return Inertia::render('Campaigns/Show', [
            'campaign' => $this->campaignPayload($campaign, [
                'has_payout_method' => filled($payoutMethod?->paypal_email)
                    || filled($payoutMethod?->stripe_payment_method_id),
                'payout_settings_url' => route('payouts.index'),
            ]),
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

    private function campaignPayload(Campaign $campaign, ?array $participantState = null): array
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
            'share_message_template' => $campaign->share_message_template,
            'status' => $campaign->status,
            'expires_at' => $campaign->expires_at?->toIso8601String(),
            'click_count' => (int) ($campaign->clicks_count ?? $campaign->click_count ?? 0),
            'conversion_count' => (int) ($campaign->conversions_count ?? $campaign->conversion_count ?? 0),
            'participants_count' => (int) ($campaign->referral_tokens_count ?? 0),
            'destination_url' => $campaign->destination_url,
            'campaign_banner' => $campaign->campaign_banner,
            'campaign_banner_url' => $this->publicStorageUrl($campaign->campaign_banner, $campaign->updated_at?->timestamp),
            'referral_url' => $token ? route('referrals.show', $token->token) : null,
            'share_message' => $token ? $this->shareMessage($campaign, route('referrals.show', $token->token)) : null,
            'has_payout_method' => (bool) ($participantState['has_payout_method'] ?? false),
            'payout_settings_url' => $participantState['payout_settings_url'] ?? route('payouts.index'),
            'brand_stats' => $this->brandStats($campaign),
        ];
    }

    private function shareMessage(Campaign $campaign, string $referralUrl): string
    {
        $template = filled($campaign->share_message_template)
            ? $campaign->share_message_template
            : self::DEFAULT_SHARE_MESSAGE_TEMPLATE;

        return strtr($template, [
            '{business_name}' => $campaign->brand?->name ?? $campaign->brand_name ?? 'this brand',
            '{campaign_title}' => $campaign->title,
            '{referral_link}' => $referralUrl,
        ]);
    }

    private function brandStats(Campaign $campaign): array
    {
        $campaigns = Campaign::query()
            ->where('status', '!=', 'draft');

        if ($campaign->brand_id) {
            $campaigns->where('brand_id', $campaign->brand_id);
        } elseif ($campaign->business_owner_id) {
            $campaigns->where('business_owner_id', $campaign->business_owner_id);
        } else {
            return [
                'campaigns_launched' => 0,
                'average_rating' => null,
            ];
        }

        return [
            'campaigns_launched' => $campaigns->count(),
            'average_rating' => null,
        ];
    }

    private function applyCategoryFilter($query, string $category): void
    {
        if ($category === '' || $category === 'all') {
            return;
        }

        if (str_starts_with($category, 'legacy:')) {
            $legacyCategory = substr($category, strlen('legacy:'));

            $query->where(function ($query) use ($legacyCategory) {
                $query
                    ->where('category', $legacyCategory)
                    ->orWhere('category_other', $legacyCategory);
            });

            return;
        }

        if ($category === Taxonomy::OTHER) {
            $predefinedLabels = array_map(fn (string $label) => strtolower($label), Taxonomy::CAMPAIGN_CATEGORIES);

            $query->where(function ($query) use ($predefinedLabels) {
                $query
                    ->where('category_key', Taxonomy::OTHER)
                    ->orWhereNotNull('category_other')
                    ->orWhere(function ($query) use ($predefinedLabels) {
                        $query
                            ->whereNull('category_key')
                            ->whereNotNull('category')
                            ->whereNotIn(DB::raw('LOWER(category)'), $predefinedLabels);
                    });
            });

            return;
        }

        if (array_key_exists($category, Taxonomy::CAMPAIGN_CATEGORIES)) {
            $label = Taxonomy::CAMPAIGN_CATEGORIES[$category];

            $query->where(function ($query) use ($category, $label) {
                $query
                    ->where('category_key', $category)
                    ->orWhere(function ($query) use ($label) {
                        $query
                            ->whereNull('category_key')
                            ->where('category', $label);
                    });
            });

            return;
        }

        $query->where('category', $category);
    }

    private function categoryOptions()
    {
        $options = collect([[
            'value' => 'all',
            'label' => 'All Categories',
            'type' => 'all',
        ]]);

        $predefined = collect(Taxonomy::CAMPAIGN_CATEGORIES)
            ->map(fn (string $label, string $key) => [
                'value' => $key,
                'label' => $label,
                'type' => 'predefined',
            ])
            ->values();

        $seenLabels = collect(Taxonomy::CAMPAIGN_CATEGORIES)
            ->mapWithKeys(fn (string $label) => [strtolower($label) => true])
            ->all();

        $legacyValues = Campaign::query()
            ->available()
            ->where(function ($query) {
                $query
                    ->whereNotNull('category')
                    ->orWhereNotNull('category_other');
            })
            ->get(['category', 'category_other'])
            ->flatMap(fn (Campaign $campaign) => [$campaign->category, $campaign->category_other])
            ->filter(fn ($value) => filled($value))
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn (string $value) => $value !== '');

        $legacyOptions = $legacyValues
            ->unique(fn (string $value) => strtolower($value))
            ->reject(function (string $value) use (&$seenLabels) {
                $normalized = strtolower($value);

                if (isset($seenLabels[$normalized])) {
                    return true;
                }

                $seenLabels[$normalized] = true;

                return false;
            })
            ->sortBy(fn (string $value) => strtolower($value))
            ->map(fn (string $value) => [
                'value' => 'legacy:'.$value,
                'label' => $value,
                'type' => 'legacy',
            ])
            ->values();

        return $options
            ->merge($predefined)
            ->merge($legacyOptions)
            ->values();
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
