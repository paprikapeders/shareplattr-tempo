<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Click;
use App\Models\Conversion;
use App\Models\Reward;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use RuntimeException;

class BusinessCampaignController extends Controller
{
    private const CLICK_SOURCES = [
        'facebook' => 'Facebook',
        'x' => 'X',
        'instagram' => 'Instagram',
        'tiktok' => 'TikTok',
        'messenger' => 'Messenger',
        'whatsapp' => 'WhatsApp',
        'telegram' => 'Telegram',
        'discord' => 'Discord',
        'copy' => 'Copy',
        'direct' => 'Direct',
    ];

    public function index(Request $request)
    {
        $campaigns = Campaign::query()
            ->where('business_owner_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Campaign $campaign) => $this->campaignPayload($campaign));

        return Inertia::render('Business/Campaigns/Index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function create()
    {
        return Inertia::render('Business/Campaigns/Create', [
            'statuses' => $this->statuses(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $profile = $request->user()->businessProfile;
        $validated = $this->validatedCampaign($request);
        $bannerPath = $request->hasFile('campaign_banner')
            ? $this->storeCampaignBanner($request->file('campaign_banner'))
            : null;

        Campaign::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'business_owner_id' => $request->user()->id,
            'brand_id' => $profile->brand_id,
            'brand_name' => $profile->company_name,
            'reward_amount' => $this->dollarsToCents($validated['reward_amount']),
            'campaign_banner' => $bannerPath,
        ]);

        return redirect()->route('business.campaigns.index')->with('success', 'Campaign created.');
    }

    public function show(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);

        return Inertia::render('Business/Campaigns/Show', [
            'campaign' => [
                ...$this->campaignPayload($campaign),
                'source_breakdown' => $this->sourceBreakdown($campaign),
            ],
        ]);
    }

    public function edit(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);

        return Inertia::render('Business/Campaigns/Edit', [
            'campaign' => [
                ...$this->campaignPayload($campaign),
                'reward_amount_dollars' => number_format($campaign->reward_amount / 100, 2, '.', ''),
                'expires_at' => $campaign->expires_at?->format('Y-m-d'),
            ],
            'statuses' => $this->statuses(),
        ]);
    }

    public function update(Request $request, Campaign $campaign): RedirectResponse
    {
        $this->authorizeOwner($request, $campaign);

        $validated = $this->validatedCampaign($request);
        $oldBannerPath = $campaign->campaign_banner;
        $bannerPath = $campaign->campaign_banner;

        if ($request->hasFile('campaign_banner')) {
            $bannerPath = $this->storeCampaignBanner($request->file('campaign_banner'));
        }

        $campaign->update([
            ...$validated,
            'business_owner_id' => $request->user()->id,
            'reward_amount' => $this->dollarsToCents($validated['reward_amount']),
            'campaign_banner' => $bannerPath,
        ]);

        if ($oldBannerPath && $bannerPath !== $oldBannerPath) {
            Storage::disk('public')->delete($oldBannerPath);
        }

        return redirect()->route('business.campaigns.index')->with('success', 'Campaign updated.');
    }

    public function updateStatus(Request $request, Campaign $campaign): RedirectResponse
    {
        $this->authorizeOwner($request, $campaign);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'paused'])],
        ]);

        abort_unless(in_array($campaign->status, ['active', 'paused'], true), 422);

        $campaign->update([
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Campaign status updated.');
    }

    public function stats(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);

        $clicks = Click::query()->where('campaign_id', $campaign->id);
        $conversions = Conversion::query()->where('campaign_id', $campaign->id);
        $totalClicks = (clone $clicks)->count();
        $totalConversions = (clone $conversions)->count();

        return Inertia::render('Business/Campaigns/Stats', [
            'campaign' => $this->campaignPayload($campaign),
            'stats' => [
                'total_clicks' => $totalClicks,
                'unique_clicks' => (clone $clicks)->where('is_flagged', false)->count(),
                'flagged_clicks' => (clone $clicks)->where('is_flagged', true)->count(),
                'conversions' => $totalConversions,
                'conversion_rate' => $totalClicks > 0 ? round(($totalConversions / $totalClicks) * 100, 2) : 0,
                'reward_amount' => $campaign->reward_amount,
                'total_rewards_generated' => Reward::query()->where('campaign_id', $campaign->id)->sum('amount'),
            ],
            'recentClicks' => (clone $clicks)
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (Click $click) => [
                    'id' => $click->id,
                    'ip_address' => $click->ip_address,
                    'is_flagged' => $click->is_flagged,
                    'flag_reason' => $click->flag_reason,
                    'created_at' => $click->created_at->toDateTimeString(),
                ]),
            'recentConversions' => (clone $conversions)
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (Conversion $conversion) => [
                    'id' => $conversion->id,
                    'amount' => $conversion->amount,
                    'status' => $conversion->status,
                    'created_at' => $conversion->created_at->toDateTimeString(),
                ]),
        ]);
    }

    private function authorizeOwner(Request $request, Campaign $campaign): void
    {
        abort_unless((int) $campaign->business_owner_id === (int) $request->user()->id, 403);
    }

    private function validatedCampaign(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'category' => ['required', 'string', 'max:255'],
            'reward_amount' => ['required', 'numeric', 'min:0.01'],
            'destination_url' => ['required', 'url', 'max:2048'],
            'campaign_banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'status' => ['required', Rule::in($this->statuses())],
            'expires_at' => ['nullable', 'date'],
        ]);
    }

    private function storeCampaignBanner(UploadedFile $file): string
    {
        $extension = $file->extension() ?: $file->getClientOriginalExtension() ?: 'jpg';
        $path = Storage::disk('public')->putFileAs(
            'campaign-banners',
            $file,
            Str::uuid().'.'.strtolower($extension),
        );

        if (! $path) {
            throw new RuntimeException('Campaign banner upload failed.');
        }

        return $path;
    }

    private function publicStorageUrl(?string $path, ?int $version = null): ?string
    {
        if (! $path) {
            return null;
        }

        $url = Storage::disk('public')->url($path);

        return $version ? $url.(str_contains($url, '?') ? '&' : '?').'v='.$version : $url;
    }

    private function dollarsToCents(string|int|float $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }

    private function statuses(): array
    {
        return ['draft', 'active', 'paused'];
    }

    private function campaignPayload(Campaign $campaign): array
    {
        return [
            'id' => $campaign->id,
            'title' => $campaign->title,
            'description' => $campaign->description,
            'brand_name' => $campaign->brand_name,
            'category' => $campaign->category,
            'reward_amount' => $campaign->reward_amount,
            'destination_url' => $campaign->destination_url,
            'campaign_banner_url' => $this->publicStorageUrl($campaign->campaign_banner, $campaign->updated_at?->timestamp),
            'status' => $campaign->status,
            'click_count' => $campaign->click_count,
            'conversion_count' => $campaign->conversion_count,
            'created_at' => $campaign->created_at?->toDateString(),
            'expires_at' => $campaign->expires_at?->toDateString(),
        ];
    }

    private function sourceBreakdown(Campaign $campaign): array
    {
        $counts = Click::query()
            ->where('campaign_id', $campaign->id)
            ->selectRaw('COALESCE(source, ?) as source, COUNT(*) as clicks', ['direct'])
            ->groupByRaw('COALESCE(source, ?)', ['direct'])
            ->pluck('clicks', 'source');

        return collect(self::CLICK_SOURCES)
            ->map(fn (string $label, string $source) => [
                'source' => $source,
                'label' => $label,
                'clicks' => (int) ($counts[$source] ?? 0),
            ])
            ->values()
            ->all();
    }
}
