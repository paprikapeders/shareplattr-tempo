<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Reward;
use Illuminate\Http\Request;
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

        $campaigns = Campaign::query()
            ->with('brand:id,name,logo,logo_url,description,business_type,website_url,country_region,affiliate_url,contact_info,notes')
            ->with(['referralTokens' => fn ($query) => $query->where('user_id', $user->id)])
            ->withCount(['referralTokens', 'clicks', 'conversions'])
            ->available()
            ->latest()
            ->get()
            ->map(fn (Campaign $campaign) => $this->campaignPayload($campaign));

        return Inertia::render('Campaigns', [
            'campaigns' => $campaigns,
            'categories' => $campaigns
                ->pluck('category')
                ->filter()
                ->unique()
                ->values(),
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
            'reward_amount' => $campaign->reward_amount,
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
