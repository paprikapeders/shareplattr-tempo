<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\BusinessProfile;
use App\Models\Campaign;
use App\Models\Conversion;
use App\Models\ReferralToken;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class ConversionSimulationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_simulate_conversion_for_single_referral_token(): void
    {
        $admin = User::factory()->admin()->create();
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();
        $token = ReferralToken::create([
            'user_id' => $participant->id,
            'campaign_id' => $campaign->id,
            'token' => 'simadmin1',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.campaigns.simulate-conversion', $campaign))
            ->assertRedirect()
            ->assertSessionHas('success', 'Simulated conversion created and pending reward added.');

        $conversion = Conversion::firstOrFail();

        $this->assertSame('verified', $conversion->status);
        $this->assertSame($token->id, $conversion->referral_token_id);
        $this->assertSame('Simulated conversion for MVP testing', $conversion->notes);
        $this->assertSame(1, $campaign->fresh()->conversion_count);
        $this->assertDatabaseHas('rewards', [
            'conversion_id' => $conversion->id,
            'user_id' => $participant->id,
            'campaign_id' => $campaign->id,
            'amount' => $campaign->reward_amount,
            'status' => 'pending',
        ]);
    }

    public function test_simulate_conversion_is_not_accessible_to_participants(): void
    {
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();

        $this
            ->actingAs($participant)
            ->post(route('admin.campaigns.simulate-conversion', $campaign))
            ->assertForbidden();

        $this
            ->actingAs($participant)
            ->post(route('business.campaigns.simulate-conversion', $campaign))
            ->assertForbidden();

        $this->assertDatabaseCount('conversions', 0);
        $this->assertDatabaseCount('rewards', 0);
    }

    public function test_business_can_simulate_conversion_outside_production_for_owned_campaign(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile();
        $participant = User::factory()->create();
        $campaign = $this->createCampaign($owner, $profile);
        $token = ReferralToken::create([
            'user_id' => $participant->id,
            'campaign_id' => $campaign->id,
            'token' => 'simbiz1',
        ]);

        $this
            ->actingAs($owner)
            ->post(route('business.campaigns.simulate-conversion', $campaign), [
                'referral_token_id' => $token->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Simulated conversion created and pending reward added.');

        $this->assertDatabaseHas('conversions', [
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'referral_token_id' => $token->id,
            'status' => 'verified',
        ]);
        $this->assertDatabaseHas('rewards', [
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'status' => 'pending',
        ]);
    }

    public function test_business_simulate_conversion_is_blocked_in_production(): void
    {
        Config::set('app.env', 'production');
        [$owner, $profile] = $this->businessOwnerWithProfile();
        $participant = User::factory()->create();
        $campaign = $this->createCampaign($owner, $profile);
        ReferralToken::create([
            'user_id' => $participant->id,
            'campaign_id' => $campaign->id,
            'token' => 'simbizprod',
        ]);

        $this
            ->actingAs($owner)
            ->post(route('business.campaigns.simulate-conversion', $campaign))
            ->assertNotFound();

        $this->assertDatabaseCount('conversions', 0);
        $this->assertDatabaseCount('rewards', 0);
    }

    private function businessOwnerWithProfile(): array
    {
        $owner = User::factory()->businessOwner()->create();
        $brand = Brand::create(['name' => 'Demo Business', 'business_type' => 'Retail']);
        $profile = BusinessProfile::create([
            'user_id' => $owner->id,
            'brand_id' => $brand->id,
            'company_name' => 'Demo Business',
            'contact_person_name' => $owner->name,
            'industry' => 'Retail',
            'industry_key' => 'retail',
        ]);

        return [$owner, $profile];
    }

    private function createCampaign(?User $owner = null, ?BusinessProfile $profile = null): Campaign
    {
        return Campaign::create([
            'created_by' => $owner?->id,
            'business_owner_id' => $owner?->id,
            'brand_id' => $profile?->brand_id,
            'brand_name' => $profile?->company_name ?? 'Northstar Coffee',
            'title' => fake()->unique()->sentence(3),
            'description' => 'A simple campaign for testing simulated conversions.',
            'category' => 'Food & Drink',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/simulated',
            'status' => 'active',
        ]);
    }
}
