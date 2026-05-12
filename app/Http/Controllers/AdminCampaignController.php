<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Campaign;
use App\Support\ImportKey;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use RuntimeException;

class AdminCampaignController extends Controller
{
    private const DUPLICATE_TITLE_MESSAGE = 'A campaign with this title already exists for this brand.';

    /**
     * Show all campaigns for admin management.
     */
    public function index()
    {
        $campaigns = Campaign::query()
            ->with('brand:id,name,logo,logo_url')
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
        $bannerPath = $request->hasFile('campaign_banner')
            ? $this->storeCampaignBanner($request->file('campaign_banner'))
            : null;

        try {
            Campaign::create([
                ...$validated,
                'created_by' => $request->user()->id,
                'brand_name' => $brand->name,
                'reward_amount' => $this->dollarsToCents($validated['reward_amount']),
                'campaign_banner' => $bannerPath,
            ]);
        } catch (QueryException $exception) {
            if ($bannerPath) {
                Storage::disk('public')->delete($bannerPath);
            }

            $this->throwDuplicateTitleValidationExceptionIfNeeded($exception);

            throw $exception;
        }

        return redirect()->route('admin.campaigns.index')->with('success', 'Campaign created.');
    }

    /**
     * Show the campaign edit form.
     */
    public function edit(Campaign $campaign)
    {
        $campaign->load('brand:id,name,logo,logo_url');

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
        $validated = $this->validatedCampaign($request, $campaign);
        $brand = Brand::query()->findOrFail($validated['brand_id']);
        $oldBannerPath = $campaign->campaign_banner;
        $bannerPath = $campaign->campaign_banner;

        if ($request->hasFile('campaign_banner')) {
            $bannerPath = $this->storeCampaignBanner($request->file('campaign_banner'));
        }

        try {
            $campaign->update([
                ...$validated,
                'brand_name' => $brand->name,
                'reward_amount' => $this->dollarsToCents($validated['reward_amount']),
                'campaign_banner' => $bannerPath,
            ]);
        } catch (QueryException $exception) {
            if ($bannerPath && $bannerPath !== $oldBannerPath) {
                Storage::disk('public')->delete($bannerPath);
            }

            $this->throwDuplicateTitleValidationExceptionIfNeeded($exception);

            throw $exception;
        }

        if ($oldBannerPath && $bannerPath !== $oldBannerPath) {
            Storage::disk('public')->delete($oldBannerPath);
        }

        return redirect()->route('admin.campaigns.index')->with('success', 'Campaign updated.');
    }

    private function validatedCampaign(Request $request, ?Campaign $campaign = null): array
    {
        $validator = Validator::make($request->all(), [
            'brand_id' => ['required', 'exists:brands,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'category' => ['required', 'string', 'max:255'],
            'reward_amount' => ['required', 'numeric', 'min:0.01'],
            'commission_details' => ['nullable', 'string', 'max:2000'],
            'cookie_duration' => ['nullable', 'string', 'max:255'],
            'network_platform' => ['nullable', 'string', 'max:255'],
            'payout_details' => ['nullable', 'string', 'max:2000'],
            'requirements' => ['nullable', 'string', 'max:4000'],
            'deliverables' => ['nullable', 'string', 'max:4000'],
            'participant_instructions' => ['nullable', 'string', 'max:4000'],
            'destination_url' => ['required', 'url', 'max:2048'],
            'campaign_banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'status' => ['required', Rule::in($this->statuses())],
            'expires_at' => ['nullable', 'date'],
        ]);

        $validator->after(function ($validator) use ($campaign) {
            if ($validator->errors()->has('brand_id') || $validator->errors()->has('title')) {
                return;
            }

            $data = $validator->getData();

            if ($this->campaignTitleExists((int) $data['brand_id'], $data['title'], $campaign?->id)) {
                $validator->errors()->add('title', self::DUPLICATE_TITLE_MESSAGE);
            }
        });

        return $validator->validate();
    }

    private function campaignTitleExists(int $brandId, string $title, ?int $ignoreCampaignId = null): bool
    {
        return Campaign::query()
            ->where('brand_id', $brandId)
            ->where('normalized_title', ImportKey::normalize($title))
            ->when($ignoreCampaignId, fn ($query) => $query->whereKeyNot($ignoreCampaignId))
            ->exists();
    }

    private function throwDuplicateTitleValidationExceptionIfNeeded(QueryException $exception): void
    {
        if (! $exception instanceof UniqueConstraintViolationException
            && ! str_contains($exception->getMessage(), 'Duplicate entry')) {
            return;
        }

        if (! str_contains($exception->getMessage(), 'campaigns_brand_normalized_title_unique')
            && ! str_contains($exception->getMessage(), 'campaign_brand_normalized_title_unique')) {
            return;
        }

        throw ValidationException::withMessages([
            'title' => self::DUPLICATE_TITLE_MESSAGE,
        ]);
    }

    private function dollarsToCents(string|int|float $amount): int
    {
        return (int) round(((float) $amount) * 100);
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

        if (! $version) {
            return $url;
        }

        return $url.(str_contains($url, '?') ? '&' : '?').'v='.$version;
    }

    private function statuses(): array
    {
        return ['active', 'inactive', 'draft', 'paused'];
    }

    private function campaignPayload(Campaign $campaign): array
    {
        return [
            'id' => $campaign->id,
            'brand_id' => $campaign->brand_id,
            'brand_name' => $campaign->brand?->name ?? $campaign->brand_name,
            'brand_logo_url' => $campaign->brand?->logo ? Storage::disk('public')->url($campaign->brand->logo) : $campaign->brand?->logo_url,
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
            'destination_url' => $campaign->destination_url,
            'campaign_banner_url' => $this->publicStorageUrl($campaign->campaign_banner, $campaign->updated_at?->timestamp),
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
