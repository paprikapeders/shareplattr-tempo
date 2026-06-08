<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Click;
use App\Models\Conversion;
use App\Models\PayoutRequest;
use App\Models\ReferralToken;
use App\Models\Reward;
use App\Support\ImportKey;
use App\Support\Taxonomy;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use RuntimeException;

class BusinessCampaignController extends Controller
{
    private const DUPLICATE_TITLE_MESSAGE = 'A campaign with this title already exists for this brand.';

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
        'direct' => 'Direct / Unknown',
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
        $profile = request()->user()->businessProfile;

        return Inertia::render('Business/Campaigns/Create', [
            'statuses' => $this->statuses(),
            'brand' => [
                'name' => $profile?->company_name,
                'logo_url' => $profile?->logo_path ? Storage::disk('public')->url($profile->logo_path) : null,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $profile = $request->user()->businessProfile;
        $validated = $this->validatedCampaign($request, $profile->brand_id);
        $bannerPath = $request->hasFile('campaign_banner')
            ? $this->storeCampaignBanner($request->file('campaign_banner'))
            : null;

        try {
            Campaign::create([
                ...$validated,
                'created_by' => $request->user()->id,
                'business_owner_id' => $request->user()->id,
                'brand_id' => $profile->brand_id,
                'brand_name' => $profile->company_name,
                'reward_amount' => $this->storedRewardAmount($validated['reward_type'], $validated['reward_amount']),
                'campaign_banner' => $bannerPath,
            ]);
        } catch (QueryException $exception) {
            if ($bannerPath) {
                Storage::disk('public')->delete($bannerPath);
            }

            $this->throwDuplicateTitleValidationExceptionIfNeeded($exception);

            throw $exception;
        }

        return redirect()->route('business.campaigns.index')->with('success', 'Campaign created.');
    }

    public function show(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);
        $summary = $this->statsPayload($campaign);

        return Inertia::render('Business/Campaigns/Show', [
            'campaign' => [
                ...$this->campaignPayload($campaign),
                'stats' => $summary['stats'],
                'source_breakdown' => $summary['source_breakdown'],
                'location_breakdown' => $summary['location_breakdown'],
                'participants' => $this->participantsPayload($campaign),
                'payout_requests' => $this->campaignPayoutRequestsPayload($campaign),
                'recentClicks' => $summary['recentClicks'],
                'recentConversions' => $summary['recentConversions'],
                'pending_conversions' => $this->pendingConversionQueue($campaign),
                'referral_tokens' => ReferralToken::query()
                    ->where('campaign_id', $campaign->id)
                    ->with('user:id,name,email')
                    ->latest()
                    ->get(['id', 'campaign_id', 'user_id', 'token'])
                    ->map(fn (ReferralToken $token) => [
                        'id' => $token->id,
                        'token' => $token->token,
                        'user_name' => $token->user?->name,
                        'user_email' => $token->user?->email,
                    ]),
                'can_simulate_conversion' => config('app.env') !== 'production',
            ],
        ]);
    }

    public function preview(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);

        $campaign->load([
            'brand:id,name,logo,logo_url,description,business_type,website_url,country_region,affiliate_url,contact_info,notes',
        ]);
        $campaign->loadCount(['referralTokens', 'clicks', 'conversions']);

        return Inertia::render('Campaigns/Show', [
            'campaign' => $this->clientCampaignPayload($campaign),
            'topPerformers' => [],
            'businessPreview' => true,
        ]);
    }

    public function edit(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);

        return Inertia::render('Business/Campaigns/Edit', [
            'campaign' => [
                ...$this->campaignPayload($campaign),
                'reward_amount_dollars' => $this->editableRewardAmount($campaign),
                'expires_at' => $campaign->expires_at?->format('Y-m-d'),
            ],
            'statuses' => $this->statuses(),
        ]);
    }

    public function update(Request $request, Campaign $campaign): RedirectResponse
    {
        $this->authorizeOwner($request, $campaign);

        $validated = $this->validatedCampaign($request, $campaign->brand_id, $campaign);
        $oldBannerPath = $campaign->campaign_banner;
        $bannerPath = $campaign->campaign_banner;

        if ($request->hasFile('campaign_banner')) {
            $bannerPath = $this->storeCampaignBanner($request->file('campaign_banner'));
        }

        try {
            $campaign->update([
                ...$validated,
                'business_owner_id' => $request->user()->id,
                'reward_amount' => $this->storedRewardAmount($validated['reward_type'], $validated['reward_amount']),
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

        return redirect()->route('business.campaigns.show', $campaign);
    }

    public function statsSummary(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);

        $summary = $this->statsPayload($campaign);

        return response()->json([
            ...$summary,
            'campaign' => [
                'id' => $campaign->id,
                'click_count' => (int) $campaign->fresh()->click_count,
                'conversion_count' => (int) Conversion::query()->where('campaign_id', $campaign->id)->count(),
                'source_breakdown' => $this->sourceBreakdown($campaign),
                'location_breakdown' => $this->locationBreakdown($campaign),
                'pending_conversions' => $this->pendingConversionQueue($campaign),
            ],
        ]);
    }

    private function authorizeOwner(Request $request, Campaign $campaign): void
    {
        abort_unless((int) $campaign->business_owner_id === (int) $request->user()->id, 403);
    }

    private function validatedCampaign(Request $request, int $brandId, ?Campaign $campaign = null): array
    {
        $request->merge([
            'reward_type' => $request->input('reward_type', 'flat'),
        ]);

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'category_key' => ['required', Rule::in(array_keys(Taxonomy::CAMPAIGN_CATEGORIES))],
            'category_other' => ['nullable', 'string', 'max:255', 'required_if:category_key,other'],
            'reward_type' => ['required', Rule::in(['flat', 'percentage'])],
            'reward_amount' => ['required', 'numeric', 'min:0.01'],
            'destination_url' => ['required', 'url', 'max:2048'],
            'share_message_template' => ['nullable', 'string', 'max:1000'],
            'campaign_terms' => ['nullable', 'string'],
            'campaign_banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'status' => ['required', Rule::in($this->statuses())],
            'expires_at' => ['nullable', 'date'],
        ]);

        $validator->after(function ($validator) use ($brandId, $campaign) {
            if ($validator->errors()->has('title')) {
                return;
            }

            $data = $validator->getData();

            if (($data['reward_type'] ?? 'flat') === 'percentage' && (float) ($data['reward_amount'] ?? 0) > 100) {
                $validator->errors()->add('reward_amount', 'The reward percentage must not be greater than 100.');
            }

            if ($this->campaignTitleExists($brandId, $data['title'], $campaign?->id)) {
                $validator->errors()->add('title', self::DUPLICATE_TITLE_MESSAGE);
            }
        });

        $validated = $validator->validate();
        if ($validated['category_key'] !== Taxonomy::OTHER) {
            $validated['category_other'] = null;
        }

        $validated['category'] = Taxonomy::campaignCategoryLabel(
            $validated['category_key'],
            $validated['category_other'] ?? null,
        );
        $validated['expires_at'] = $this->normalizeExpiryDate($validated['expires_at'] ?? null);

        return $validated;
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

    private function percentageToBasisPoints(string|int|float $percentage): int
    {
        return (int) round(((float) $percentage) * 100);
    }

    private function storedRewardAmount(string $rewardType, string|int|float $amount): int
    {
        return $rewardType === 'percentage'
            ? $this->percentageToBasisPoints($amount)
            : $this->dollarsToCents($amount);
    }

    private function normalizeExpiryDate(mixed $expiresAt): ?Carbon
    {
        if (blank($expiresAt)) {
            return null;
        }

        $expiresAt = (string) $expiresAt;
        $date = Carbon::parse($expiresAt, config('app.timezone'));

        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $expiresAt)
            ? $date->endOfDay()
            : $date;
    }

    private function editableRewardAmount(Campaign $campaign): string
    {
        if (($campaign->reward_type ?? 'flat') === 'percentage') {
            return rtrim(rtrim(number_format($campaign->reward_amount / 100, 2, '.', ''), '0'), '.');
        }

        return number_format($campaign->reward_amount / 100, 2, '.', '');
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
            'category_key' => $campaign->category_key,
            'category_other' => $campaign->category_other,
            'slug' => $campaign->slug,
            'participant_campaign_url' => route('campaigns.show', $campaign->slug ?? $campaign->id),
            'business_preview_url' => route('business.campaigns.preview', $campaign),
            'reward_type' => $campaign->reward_type ?? 'flat',
            'reward_amount' => $campaign->reward_amount,
            'reward_display' => $this->rewardDisplay($campaign),
            'destination_url' => $campaign->destination_url,
            'share_message_template' => $campaign->share_message_template,
            'campaign_terms' => $campaign->campaign_terms,
            'campaign_banner_url' => $this->publicStorageUrl($campaign->campaign_banner, $campaign->updated_at?->timestamp),
            'status' => $campaign->status,
            'click_count' => $campaign->click_count,
            'conversion_count' => $campaign->conversion_count,
            'created_at' => $campaign->created_at?->toDateString(),
            'expires_at' => $campaign->expires_at?->toDateString(),
        ];
    }

    private function clientCampaignPayload(Campaign $campaign): array
    {
        return [
            'id' => $campaign->id,
            'slug' => $campaign->slug,
            'participant_campaign_url' => route('campaigns.show', $campaign->slug ?? $campaign->id),
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
            'campaign_terms' => $campaign->campaign_terms,
            'status' => $campaign->status,
            'expires_at' => $campaign->expires_at?->toIso8601String(),
            'click_count' => (int) ($campaign->clicks_count ?? $campaign->click_count ?? 0),
            'conversion_count' => (int) ($campaign->conversions_count ?? $campaign->conversion_count ?? 0),
            'participants_count' => (int) ($campaign->referral_tokens_count ?? 0),
            'destination_url' => $campaign->destination_url,
            'share_message_template' => $campaign->share_message_template,
            'campaign_banner' => $campaign->campaign_banner,
            'campaign_banner_url' => $this->publicStorageUrl($campaign->campaign_banner, $campaign->updated_at?->timestamp),
            'referral_url' => null,
            'brand_stats' => $this->brandStats($campaign),
        ];
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

    private function rewardDisplay(Campaign $campaign): string
    {
        if (($campaign->reward_type ?? 'flat') === 'percentage') {
            $percentage = rtrim(rtrim(number_format($campaign->reward_amount / 100, 2, '.', ''), '0'), '.');

            return $percentage.'%';
        }

        return '$'.number_format($campaign->reward_amount / 100, 2);
    }

    private function statsPayload(Campaign $campaign): array
    {
        $clicks = Click::query()->where('campaign_id', $campaign->id);
        $conversions = Conversion::query()->where('campaign_id', $campaign->id);
        $totalClicks = (clone $clicks)->count();
        $totalConversions = (clone $conversions)->count();

        return [
            'stats' => [
                'total_clicks' => $totalClicks,
                'unique_clicks' => (clone $clicks)->where('is_flagged', false)->count(),
                'flagged_clicks' => (clone $clicks)->where('is_flagged', true)->count(),
                'conversions' => $totalConversions,
                'conversion_rate' => $totalClicks > 0 ? round(($totalConversions / $totalClicks) * 100, 2) : 0,
                'reward_amount' => $campaign->reward_amount,
                'total_rewards_generated' => (int) Reward::query()->where('campaign_id', $campaign->id)->sum('amount'),
            ],
            'source_breakdown' => $this->sourceBreakdown($campaign),
            'location_breakdown' => $this->locationBreakdown($campaign),
            'recentClicks' => (clone $clicks)
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (Click $click) => [
                    'id' => $click->id,
                    'location_label' => $this->locationLabel($click->country, $click->region),
                    'source' => $click->source ?? 'direct',
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
        ];
    }

    private function sourceBreakdown(Campaign $campaign): array
    {
        $counts = Click::query()
            ->where('campaign_id', $campaign->id)
            ->selectRaw("COALESCE(`source`, 'direct') as normalized_source, COUNT(*) as clicks")
            ->groupByRaw("COALESCE(`source`, 'direct')")
            ->pluck('clicks', 'normalized_source');

        return collect(self::CLICK_SOURCES)
            ->map(fn (string $label, string $source) => [
                'source' => $source,
                'label' => $label,
                'clicks' => (int) ($counts[$source] ?? 0),
            ])
            ->values()
            ->all();
    }

    private function pendingConversionQueue(Campaign $campaign): array
    {
        return Conversion::query()
            ->where('campaign_id', $campaign->id)
            ->where('status', 'pending')
            ->with([
                'user:id,name,email',
                'referralToken.user:id,name,email',
            ])
            ->latest()
            ->get()
            ->map(function (Conversion $conversion) use ($campaign) {
                $owner = $conversion->referralToken?->user ?? $conversion->user;

                return [
                    'id' => $conversion->id,
                    'participant_name' => $owner?->name ?? 'Participant',
                    'participant_email' => $owner?->email,
                    'campaign' => $campaign->title,
                    'amount' => $conversion->amount,
                    'amount_display' => '$'.number_format($conversion->amount / 100, 2),
                    'reward_display' => $this->rewardDisplay($campaign),
                    'created_at' => $conversion->created_at?->toDateString(),
                    'status' => $conversion->status,
                ];
            })
            ->all();
    }

    private function locationBreakdown(Campaign $campaign): array
    {
        return Click::query()
            ->where('campaign_id', $campaign->id)
            ->selectRaw('country, country_code, region, COUNT(*) as clicks, SUM(CASE WHEN is_flagged = 0 THEN 1 ELSE 0 END) as unique_clicks')
            ->groupBy('country', 'country_code', 'region')
            ->orderByDesc('clicks')
            ->orderByRaw('country IS NULL')
            ->orderBy('country')
            ->orderBy('region')
            ->get()
            ->map(fn ($row) => [
                'country' => $row->country,
                'country_code' => $row->country_code,
                'region' => $row->region,
                'label' => $this->locationLabel($row->country, $row->region),
                'clicks' => (int) $row->clicks,
                'unique_clicks' => (int) $row->unique_clicks,
            ])
            ->all();
    }

    private function participantsPayload(Campaign $campaign): array
    {
        return ReferralToken::query()
            ->where('campaign_id', $campaign->id)
            ->with('user:id,name,email')
            ->withCount([
                'clicks',
                'clicks as unique_clicks_count' => fn ($query) => $query->where('is_flagged', false),
                'conversions',
            ])
            ->latest()
            ->get()
            ->map(function (ReferralToken $token) use ($campaign) {
                $latestClickAt = Click::query()
                    ->where('referral_token_id', $token->id)
                    ->latest('created_at')
                    ->value('created_at');
                $latestConversionAt = Conversion::query()
                    ->where('referral_token_id', $token->id)
                    ->latest('created_at')
                    ->value('created_at');
                $latestActivityAt = collect([$token->created_at, $latestClickAt, $latestConversionAt])
                    ->filter()
                    ->max();

                return [
                    'id' => $token->id,
                    'participant_name' => $token->user?->name ?? 'Participant',
                    'participant_email' => $token->user?->email,
                    'joined_at' => $token->created_at?->toDateTimeString(),
                    'total_clicks' => (int) $token->clicks_count,
                    'unique_clicks' => (int) $token->unique_clicks_count,
                    'conversions' => (int) $token->conversions_count,
                    'rewards_generated' => (int) Reward::query()
                        ->where('campaign_id', $campaign->id)
                        ->where('user_id', $token->user_id)
                        ->sum('amount'),
                    'latest_activity_at' => $latestActivityAt ? Carbon::parse($latestActivityAt)->toDateTimeString() : null,
                ];
            })
            ->all();
    }

    private function campaignPayoutRequestsPayload(Campaign $campaign): array
    {
        return PayoutRequest::query()
            ->whereHas('rewards', fn ($query) => $query
                ->where('campaign_id', $campaign->id)
                ->whereHas('conversion', fn ($conversionQuery) => $conversionQuery
                    ->where('campaign_id', $campaign->id)
                )
                ->whereHas('campaign', fn ($campaignQuery) => $campaignQuery
                    ->where('business_owner_id', $campaign->business_owner_id)
                )
            )
            ->with([
                'user:id,name,email',
                'payoutMethod:id,type,paypal_email,stripe_card_brand,stripe_card_last4',
                'rewards' => fn ($query) => $query
                    ->where('campaign_id', $campaign->id)
                    ->whereHas('conversion', fn ($conversionQuery) => $conversionQuery
                        ->where('campaign_id', $campaign->id)
                    ),
            ])
            ->latest('requested_at')
            ->latest()
            ->get()
            ->map(function (PayoutRequest $payoutRequest) {
                $campaignRewards = $payoutRequest->rewards;
                $payoutMethod = $payoutRequest->payoutMethod;

                return [
                    'id' => $payoutRequest->id,
                    'participant' => [
                        'name' => $payoutRequest->user?->name ?? 'Participant',
                        'email' => $payoutRequest->user?->email,
                    ],
                    'requested_at' => $payoutRequest->requested_at?->toDateTimeString(),
                    'rewards_count' => $campaignRewards->count(),
                    'campaign_amount' => (int) $campaignRewards->sum('amount'),
                    'status' => $payoutRequest->status,
                    'payout_method' => $this->payoutMethodLabel($payoutMethod),
                    'latest_update_at' => $payoutRequest->updated_at?->toDateTimeString(),
                ];
            })
            ->all();
    }

    private function payoutMethodLabel($payoutMethod): ?string
    {
        if (! $payoutMethod) {
            return null;
        }

        if ($payoutMethod->type === 'stripe' && $payoutMethod->stripe_card_last4) {
            $brand = $payoutMethod->stripe_card_brand
                ? Str::headline($payoutMethod->stripe_card_brand)
                : 'Card';

            return $brand.' ending '.$payoutMethod->stripe_card_last4;
        }

        if ($payoutMethod->type === 'paypal' && $payoutMethod->paypal_email) {
            return 'PayPal '.$payoutMethod->paypal_email;
        }

        return Str::headline($payoutMethod->type ?? 'Payout method');
    }

    private function locationLabel(?string $country, ?string $region): string
    {
        if (blank($country) && blank($region)) {
            return 'Unknown';
        }

        if (blank($region)) {
            return $country;
        }

        if (blank($country)) {
            return $region;
        }

        return $country.' - '.$region;
    }
}
