<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Conversion;
use App\Models\ReferralToken;
use App\Models\Reward;
use App\Models\User;
use App\Services\ConversionRewardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRewardFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_conversion_creates_pending_reward(): void
    {
        $admin = User::factory()->admin()->create();
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();

        $referralToken = ReferralToken::create([
            'user_id' => $participant->id,
            'campaign_id' => $campaign->id,
            'token' => 'rewardtest1',
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.conversions.store'), [
                'campaign_id' => $campaign->id,
                'user_id' => $participant->id,
                'amount' => '49.99',
                'amount_type' => 'dollars',
                'notes' => 'Manual verified sale.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Conversion recorded and reward created.');

        $this->assertDatabaseHas('conversions', [
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'referral_token_id' => $referralToken->id,
            'amount' => 4999,
            'status' => 'verified',
        ]);

        $this->assertSame(1, $campaign->fresh()->conversion_count);

        $conversion = Conversion::firstOrFail();

        $this->assertDatabaseHas('rewards', [
            'conversion_id' => $conversion->id,
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'amount' => $campaign->reward_amount,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_mark_pending_reward_as_paid(): void
    {
        $admin = User::factory()->admin()->create();
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();

        $conversion = Conversion::create([
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'amount' => 4999,
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        $reward = Reward::create([
            'conversion_id' => $conversion->id,
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'amount' => $campaign->reward_amount,
            'status' => 'pending',
        ]);

        $response = $this
            ->actingAs($admin)
            ->patch(route('admin.rewards.mark-paid', $reward), [
                'payout_reference' => 'PAYPAL-TXN-123',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Reward marked as paid.');

        $reward->refresh();

        $this->assertSame('paid', $reward->status);
        $this->assertNotNull($reward->paid_at);
        $this->assertSame('PAYPAL-TXN-123', $reward->payout_reference);
    }

    public function test_verified_conversion_reward_creation_is_not_duplicated(): void
    {
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();
        $conversion = Conversion::create([
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'amount' => 4999,
            'status' => 'verified',
            'verified_at' => now(),
        ]);
        $service = app(ConversionRewardService::class);

        $service->createPendingRewardFor($conversion);
        $service->createPendingRewardFor($conversion);

        $this->assertSame(1, Reward::query()->where('conversion_id', $conversion->id)->count());
        $this->assertDatabaseHas('rewards', [
            'conversion_id' => $conversion->id,
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'amount' => $campaign->reward_amount,
            'status' => 'pending',
        ]);
    }

    private function createCampaign(): Campaign
    {
        return Campaign::create([
            'brand_name' => 'BrightDesk',
            'title' => 'Remote Work Setup Deal',
            'description' => 'A simple campaign for testing rewards.',
            'category' => 'Productivity',
            'reward_amount' => 2500,
            'destination_url' => 'https://example.com/brightdesk-setup',
            'status' => 'active',
        ]);
    }
}
