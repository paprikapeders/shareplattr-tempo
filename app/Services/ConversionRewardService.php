<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Conversion;
use App\Models\ReferralToken;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ConversionRewardService
{
    public function recordVerifiedConversion(
        Campaign $campaign,
        User $participant,
        int $amount,
        ?ReferralToken $referralToken = null,
        ?string $notes = null,
    ): Conversion {
        return DB::transaction(function () use ($campaign, $participant, $amount, $referralToken, $notes) {
            $conversion = Conversion::create([
                'campaign_id' => $campaign->id,
                'user_id' => $participant->id,
                'referral_token_id' => $referralToken?->id,
                'amount' => $amount,
                'status' => 'verified',
                'notes' => $notes,
                'verified_at' => now(),
            ]);

            $campaign->increment('conversion_count');
            $this->createPendingRewardFor($conversion);

            return $conversion;
        });
    }

    public function createPendingRewardFor(Conversion $conversion): ?Reward
    {
        if ($conversion->status !== 'verified') {
            return null;
        }

        $campaign = $conversion->campaign()->firstOrFail();

        return Reward::query()->firstOrCreate(
            ['conversion_id' => $conversion->id],
            [
                'user_id' => $conversion->user_id,
                'campaign_id' => $conversion->campaign_id,
                'amount' => $campaign->reward_amount,
                'status' => 'pending',
            ],
        );
    }
}
