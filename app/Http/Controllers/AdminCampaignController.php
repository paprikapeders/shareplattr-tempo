<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Campaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;

class AdminCampaignController extends Controller
{
    /**
     * Show all campaigns for admin management.
     */
    public function index()
    {
        $campaigns = Campaign::query()
            ->with('brand:id,name,logo')
            ->latest()
            ->get()
            ->map(fn (Campaign $campaign) => $this->campaignPayload($campaign));

        return Inertia::render('Admin/Campaigns/Index', [
            'campaigns' => $campaigns,
        ]);
    }

    /**
     * Show the campaign creation form.
     */
    public function create()
    {
        return Inertia::render('Admin/Campaigns/Create', [
            'statuses' => $this->statuses(),
            'brands' => $this->brandOptions(),
        ]);
    }

    /**
     * Store a newly created campaign.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedCampaign($request);
        $brand = Brand::query()->findOrFail($validated['brand_id']);
        $bannerPath = $request->file('campaign_banner')?->store('campaigns/banners', 'public');

        Campaign::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'brand_name' => $brand->name,
            'reward_amount' => $this->dollarsToCents($validated['reward_amount']),
            'campaign_banner' => $bannerPath,
        ]);

        return redirect()->route('admin.campaigns.index')->with('success', 'Campaign created.');
    }

    /**
     * Show the campaign edit form.
     */
    public function edit(Campaign $campaign)
    {
        $campaign->load('brand:id,name,logo');

        return Inertia::render('Admin/Campaigns/Edit', [
            'campaign' => [
                ...$this->campaignPayload($campaign),
                'reward_amount_dollars' => number_format($campaign->reward_amount / 100, 2, '.', ''),
                'expires_at' => $campaign->expires_at?->format('Y-m-d'),
            ],
            'statuses' => $this->statuses(),
            'brands' => $this->brandOptions(),
        ]);
    }

    /**
     * Update a campaign without touching aggregate counts.
     */
    public function update(Request $request, Campaign $campaign): RedirectResponse
    {
        $validated = $this->validatedCampaign($request);
        $brand = Brand::query()->findOrFail($validated['brand_id']);
        $bannerPath = $campaign->campaign_banner;

        if ($request->hasFile('campaign_banner')) {
            $bannerPath = $request->file('campaign_banner')->store('campaigns/banners', 'public');

            if ($campaign->campaign_banner) {
                Storage::disk('public')->delete($campaign->campaign_banner);
            }
        }

        $campaign->update([
            ...$validated,
            'brand_name' => $brand->name,
            'reward_amount' => $this->dollarsToCents($validated['reward_amount']),
            'campaign_banner' => $bannerPath,
        ]);

        return redirect()->route('admin.campaigns.index')->with('success', 'Campaign updated.');
    }

    private function validatedCampaign(Request $request): array
    {
        return $request->validate([
            'brand_id' => ['required', 'exists:brands,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'category' => ['required', 'string', 'max:255'],
            'reward_amount' => ['required', 'numeric', 'min:0.01'],
            'destination_url' => ['required', 'url', 'max:2048'],
            'campaign_banner' => ['nullable', File::image()->max(4096)],
            'status' => ['required', Rule::in($this->statuses())],
            'expires_at' => ['nullable', 'date'],
        ]);
    }

    private function dollarsToCents(string|int|float $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }

    private function statuses(): array
    {
        return ['active', 'inactive', 'draft'];
    }

    private function campaignPayload(Campaign $campaign): array
    {
        return [
            'id' => $campaign->id,
            'brand_id' => $campaign->brand_id,
            'brand_name' => $campaign->brand?->name ?? $campaign->brand_name,
            'brand_logo_url' => $campaign->brand?->logo ? Storage::disk('public')->url($campaign->brand->logo) : null,
            'title' => $campaign->title,
            'description' => $campaign->description,
            'category' => $campaign->category,
            'reward_amount' => $campaign->reward_amount,
            'destination_url' => $campaign->destination_url,
            'campaign_banner_url' => $campaign->campaign_banner ? Storage::disk('public')->url($campaign->campaign_banner) : null,
            'status' => $campaign->status,
            'click_count' => $campaign->click_count,
            'conversion_count' => $campaign->conversion_count,
            'expires_at' => $campaign->expires_at?->toDateString(),
        ];
    }

    private function brandOptions(): array
    {
        return Brand::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Brand $brand) => [
                'id' => $brand->id,
                'name' => $brand->name,
            ])
            ->all();
    }
}
