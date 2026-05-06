<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\ReferralToken;
use App\Models\User;
use App\Services\ConversionRewardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminConversionController extends Controller
{
    public function __construct(private ConversionRewardService $conversions)
    {
    }

    /**
     * Show the conversion entry form.
     */
    public function create()
    {
        return Inertia::render('Admin/Conversions/Create', [
            'campaigns' => Campaign::query()
                ->available()
                ->with('brand:id,name')
                ->orderBy('title')
                ->get(['id', 'brand_id', 'brand_name', 'title', 'reward_amount']),
            'users' => User::query()
                ->where('is_admin', false)
                ->where('user_type', 'participant')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'referralTokens' => ReferralToken::query()
                ->with('user:id,name,email')
                ->orderByDesc('created_at')
                ->get(['id', 'campaign_id', 'user_id', 'token'])
                ->map(fn (ReferralToken $token) => [
                    'id' => $token->id,
                    'campaign_id' => $token->campaign_id,
                    'user_id' => $token->user_id,
                    'token' => $token->token,
                    'user_name' => $token->user?->name,
                    'user_email' => $token->user?->email,
                ]),
        ]);
    }

    /**
     * Store a verified conversion and pending reward.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'campaign_id' => ['required', 'exists:campaigns,id'],
            'user_id' => ['required', 'exists:users,id'],
            'referral_token_id' => ['nullable', 'exists:referral_tokens,id'],
            'amount' => ['nullable', 'numeric', 'min:0.01'],
            'amount_type' => ['required', 'in:dollars,cents'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $campaign = Campaign::query()
            ->available()
            ->find($validated['campaign_id']);

        if (! $campaign) {
            return back()
                ->withErrors(['campaign_id' => 'The selected campaign is not available.'])
                ->withInput();
        }

        $participant = User::query()
            ->where('user_type', 'participant')
            ->findOrFail($validated['user_id']);

        $referralToken = $this->resolveReferralToken($campaign, $participant, $validated['referral_token_id'] ?? null);

        if (array_key_exists('referral_token_id', $validated) && filled($validated['referral_token_id']) && ! $referralToken) {
            return back()
                ->withErrors(['referral_token_id' => 'The selected referral token does not belong to this participant and campaign.'])
                ->withInput();
        }

        $amount = filled($validated['amount'] ?? null)
            ? ($validated['amount_type'] === 'dollars'
                ? (int) round($validated['amount'] * 100)
                : (int) $validated['amount'])
            : (int) $campaign->reward_amount;

        $this->conversions->recordVerifiedConversion(
            $campaign,
            $participant,
            $amount,
            $referralToken,
            $validated['notes'] ?? null,
        );

        return back()->with('success', 'Conversion recorded and reward created.');
    }

    private function resolveReferralToken(Campaign $campaign, User $participant, ?int $referralTokenId): ?ReferralToken
    {
        $query = ReferralToken::query()
            ->where('campaign_id', $campaign->id)
            ->where('user_id', $participant->id);

        if ($referralTokenId) {
            $query->whereKey($referralTokenId);
        }

        return $query->first();
    }
}
