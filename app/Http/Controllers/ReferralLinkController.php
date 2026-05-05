<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\BlockedActivity;
use App\Models\Click;
use App\Models\ReferralToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReferralLinkController extends Controller
{
    private const ALLOWED_SOURCES = [
        'facebook',
        'x',
        'instagram',
        'tiktok',
        'messenger',
        'whatsapp',
        'telegram',
        'discord',
        'copy',
        'direct',
    ];

    /**
     * Generate or return the current user's referral link for a campaign.
     */
    public function store(Request $request, string $campaign): RedirectResponse
    {
        $campaign = $this->resolveCampaign($campaign);

        if (! $campaign || ! Campaign::query()->available()->whereKey($campaign->id)->exists()) {
            return redirect()
                ->route('campaigns.index')
                ->with('error', 'That campaign is no longer available.');
        }

        $request->user()->referralTokens()->firstOrCreate(
            ['campaign_id' => $campaign->id],
            ['token' => $this->makeToken()],
        );

        return back();
    }

    /**
     * Redirect a referral token to its campaign destination.
     */
    public function show(Request $request, string $token): RedirectResponse
    {
        $referralToken = ReferralToken::with('campaign')
            ->where('token', $token)
            ->firstOrFail();

        if (! Campaign::query()->available()->whereKey($referralToken->campaign_id)->exists()) {
            BlockedActivity::create([
                'type' => 'unavailable_campaign_click',
                'referral_token_id' => $referralToken->id,
                'user_id' => $referralToken->user_id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'reason' => 'Referral link visited after campaign became unavailable.',
            ]);

            return redirect()->away($referralToken->campaign->destination_url);
        }

        $user = $request->user();

        if ($user?->id === $referralToken->user_id) {
            BlockedActivity::create([
                'type' => 'self_referral',
                'referral_token_id' => $referralToken->id,
                'user_id' => $referralToken->user_id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'reason' => 'Authenticated user attempted to use their own referral link.',
            ]);

            return redirect()->away($referralToken->campaign->destination_url);
        }

        $isDuplicate = $this->isDuplicateClick($referralToken, $request);
        $source = $this->sourceFromRequest($request);

        DB::transaction(function () use ($referralToken, $request, $isDuplicate, $source) {
            Click::create([
                'referral_token_id' => $referralToken->id,
                'campaign_id' => $referralToken->campaign_id,
                'user_id' => $referralToken->user_id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'source' => $source,
                'is_flagged' => $isDuplicate,
                'flag_reason' => $isDuplicate ? 'duplicate' : null,
            ]);

            if (! $isDuplicate) {
                $referralToken->campaign()->increment('click_count');
            }
        });

        return redirect()->away($referralToken->campaign->destination_url);
    }

    private function sourceFromRequest(Request $request): string
    {
        $source = Str::lower((string) $request->query('source', 'direct'));

        return in_array($source, self::ALLOWED_SOURCES, true) ? $source : 'direct';
    }

    private function isDuplicateClick(ReferralToken $referralToken, Request $request): bool
    {
        $ipAddress = $request->ip();

        if (! $ipAddress) {
            return false;
        }

        return Click::query()
            ->where('referral_token_id', $referralToken->id)
            ->where('ip_address', $ipAddress)
            ->where('created_at', '>=', now()->subHour())
            ->exists();
    }

    private function makeToken(): string
    {
        do {
            $token = Str::lower(Str::random(10));
        } while (ReferralToken::where('token', $token)->exists());

        return $token;
    }

    private function resolveCampaign(string $value): ?Campaign
    {
        $campaign = Campaign::query()->where('slug', $value)->first();

        if ($campaign) {
            return $campaign;
        }

        if (ctype_digit($value)) {
            return Campaign::query()->find($value);
        }

        return null;
    }
}
