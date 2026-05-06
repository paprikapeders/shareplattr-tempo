<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\ReferralToken;
use App\Models\User;
use App\Services\ConversionRewardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SimulateConversionController extends Controller
{
    public function __construct(private ConversionRewardService $conversions)
    {
    }

    public function admin(Request $request, Campaign $campaign): RedirectResponse
    {
        $validated = $request->validate([
            'referral_token_id' => ['nullable', 'exists:referral_tokens,id'],
            'user_id' => ['nullable', 'exists:users,id'],
        ]);

        return $this->simulate($campaign, $validated);
    }

    public function business(Request $request, Campaign $campaign): RedirectResponse
    {
        abort_if(config('app.env') === 'production', 404);
        abort_unless((int) $campaign->business_owner_id === (int) $request->user()->id, 403);

        $validated = $request->validate([
            'referral_token_id' => ['nullable', 'exists:referral_tokens,id'],
        ]);

        return $this->simulate($campaign, $validated);
    }

    private function simulate(Campaign $campaign, array $validated): RedirectResponse
    {
        if (! Campaign::query()->available()->whereKey($campaign->id)->exists()) {
            return back()->with('error', 'Only available campaigns can receive simulated conversions.');
        }

        $token = $this->resolveToken($campaign, $validated);

        if (! $token) {
            return back()->with('error', 'Select a referral owner before simulating a conversion.');
        }

        $participant = User::query()->findOrFail($token->user_id);

        $this->conversions->recordVerifiedConversion(
            $campaign,
            $participant,
            (int) $campaign->reward_amount,
            $token,
            'Simulated conversion for MVP testing',
        );

        return back()->with('success', 'Simulated conversion created and pending reward added.');
    }

    private function resolveToken(Campaign $campaign, array $validated): ?ReferralToken
    {
        if (! empty($validated['referral_token_id'])) {
            return ReferralToken::query()
                ->where('campaign_id', $campaign->id)
                ->whereKey($validated['referral_token_id'])
                ->first();
        }

        if (! empty($validated['user_id'])) {
            return ReferralToken::query()
                ->where('campaign_id', $campaign->id)
                ->where('user_id', $validated['user_id'])
                ->first();
        }

        $tokens = ReferralToken::query()
            ->where('campaign_id', $campaign->id)
            ->limit(2)
            ->get();

        return $tokens->count() === 1 ? $tokens->first() : null;
    }
}
