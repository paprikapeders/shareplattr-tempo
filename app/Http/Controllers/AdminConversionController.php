<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Conversion;
use App\Models\ReferralToken;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminConversionController extends Controller
{
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
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
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
            'amount' => ['required', 'numeric', 'min:0.01'],
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

        $amount = $validated['amount_type'] === 'dollars'
            ? (int) round($validated['amount'] * 100)
            : (int) $validated['amount'];

        DB::transaction(function () use ($campaign, $validated, $amount) {
            $referralToken = ReferralToken::query()
                ->where('campaign_id', $campaign->id)
                ->where('user_id', $validated['user_id'])
                ->first();

            $conversion = Conversion::create([
                'campaign_id' => $campaign->id,
                'user_id' => $validated['user_id'],
                'referral_token_id' => $referralToken?->id,
                'amount' => $amount,
                'status' => 'verified',
                'notes' => $validated['notes'] ?? null,
                'verified_at' => now(),
            ]);

            $campaign->increment('conversion_count');

            $conversion->reward()->create([
                'user_id' => $validated['user_id'],
                'campaign_id' => $campaign->id,
                'amount' => $campaign->reward_amount,
            ]);
        });

        return back()->with('success', 'Conversion recorded and reward created.');
    }
}
