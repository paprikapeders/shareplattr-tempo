<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\BusinessProfile;
use App\Models\Campaign;
use App\Models\Click;
use App\Models\PayoutMethod;
use App\Models\ReferralToken;
use App\Models\User;
use App\Services\ClickLocationResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReferralTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_referral_click_is_logged(): void
    {
        [$campaign, $token] = $this->createReferralToken();

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->get(route('referrals.show', $token->token));

        $response->assertRedirect($campaign->destination_url);

        $this->assertDatabaseHas('clicks', [
            'referral_token_id' => $token->id,
            'campaign_id' => $campaign->id,
            'user_id' => $token->user_id,
            'ip_address' => '203.0.113.10',
            'is_flagged' => false,
        ]);

        $this->assertSame(1, $campaign->fresh()->click_count);
        $this->assertDatabaseCount('conversions', 0);
        $this->assertDatabaseCount('rewards', 0);
    }

    public function test_participant_campaign_stats_summary_returns_updated_click_count_after_referral_visit(): void
    {
        [$campaign, $token, $owner] = $this->createReferralToken();

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.11'])
            ->get(route('referrals.show', ['token' => $token->token, 'source' => 'facebook']))
            ->assertRedirect($campaign->destination_url);

        $this
            ->actingAs($owner)
            ->getJson(route('campaigns.stats-summary', $campaign))
            ->assertOk()
            ->assertJsonPath('campaign_id', $campaign->id)
            ->assertJsonPath('campaign_click_count', 1)
            ->assertJsonPath('click_count', 1)
            ->assertJsonPath('participant_clicks_count', 1)
            ->assertJsonPath('participant_unique_clicks_count', 1)
            ->assertJsonPath('source_breakdown.0.source', 'facebook')
            ->assertJsonPath('source_breakdown.0.clicks', 1);
    }

    public function test_participant_dashboard_stats_summary_returns_updated_click_count_after_referral_visit(): void
    {
        [$campaign, $token, $owner] = $this->createReferralToken();

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.12'])
            ->get(route('referrals.show', $token->token))
            ->assertRedirect($campaign->destination_url);

        $this
            ->actingAs($owner)
            ->getJson(route('dashboard.stats-summary'))
            ->assertOk()
            ->assertJsonPath('stats.total_clicks', 1)
            ->assertJsonPath('stats.unique_clicks', 1)
            ->assertJsonPath('referralLinks.0.id', $token->id)
            ->assertJsonPath('referralLinks.0.clicks_count', 1)
            ->assertJsonPath('referralLinks.0.unique_clicks_count', 1);
    }

    public function test_new_participant_dashboard_shows_onboarding_empty_state(): void
    {
        $participant = User::factory()->create();

        $this
            ->actingAs($participant)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('onboarding.show', true)
                ->where('onboarding.steps.0.key', 'browse_campaigns')
                ->where('onboarding.steps.0.href', route('campaigns.index'))
                ->where('onboarding.steps.0.completed', false)
                ->where('onboarding.steps.1.key', 'join_first_campaign')
                ->where('onboarding.steps.1.completed', false)
                ->where('onboarding.steps.2.key', 'add_payout_method')
                ->where('onboarding.steps.2.href', route('payouts.index'))
                ->where('onboarding.steps.2.completed', false)
            );
    }

    public function test_participant_dashboard_onboarding_marks_payout_method_complete(): void
    {
        $participant = User::factory()->create();

        PayoutMethod::create([
            'user_id' => $participant->id,
            'type' => 'paypal',
            'paypal_email' => 'participant@example.com',
            'verified_at' => now(),
        ]);

        $this
            ->actingAs($participant)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('onboarding.show', true)
                ->where('onboarding.steps.2.completed', true)
            );
    }

    public function test_participant_dashboard_onboarding_marks_stripe_card_complete(): void
    {
        $participant = User::factory()->create();

        PayoutMethod::create([
            'user_id' => $participant->id,
            'type' => 'stripe',
            'paypal_email' => '',
            'stripe_payment_method_id' => 'pm_participant_123',
            'stripe_card_brand' => 'visa',
            'stripe_card_last4' => '4242',
        ]);

        $this
            ->actingAs($participant)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('onboarding.show', true)
                ->where('onboarding.steps.2.completed', true)
            );
    }

    public function test_participant_dashboard_with_referral_token_shows_normal_dashboard_mode(): void
    {
        [, $token, $participant] = $this->createReferralToken();

        $this
            ->actingAs($participant)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('onboarding.show', false)
                ->where('onboarding.steps.1.completed', true)
                ->where('referralLinks.0.id', $token->id)
            );
    }

    public function test_business_campaign_stats_summary_returns_updated_click_count_after_referral_visit(): void
    {
        $business = $this->createBusinessOwner();
        [$campaign, $token] = $this->createReferralToken([
            'business_owner_id' => $business->id,
        ]);

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.13'])
            ->get(route('referrals.show', ['token' => $token->token, 'source' => 'telegram']))
            ->assertRedirect($campaign->destination_url);

        $this
            ->actingAs($business)
            ->getJson(route('business.campaigns.stats-summary', $campaign))
            ->assertOk()
            ->assertJsonPath('campaign.id', $campaign->id)
            ->assertJsonPath('campaign.click_count', 1)
            ->assertJsonPath('stats.total_clicks', 1)
            ->assertJsonPath('stats.unique_clicks', 1)
            ->assertJsonPath('source_breakdown.6.source', 'telegram')
            ->assertJsonPath('source_breakdown.6.clicks', 1)
            ->assertJsonPath('recentClicks.0.location_label', 'Unknown')
            ->assertJsonMissingPath('recentClicks.0.ip_address');
    }

    public function test_referral_click_location_fields_are_stored_when_available(): void
    {
        [$campaign, $token] = $this->createReferralToken();

        $this->mock(ClickLocationResolver::class, function ($mock) {
            $mock->shouldReceive('resolve')
                ->once()
                ->with('8.8.8.8')
                ->andReturn([
                    'country' => 'Philippines',
                    'country_code' => 'PH',
                    'region' => 'Metro Manila',
                    'city' => 'Manila',
                ]);
        });

        $this
            ->withServerVariables(['REMOTE_ADDR' => '8.8.8.8'])
            ->get(route('referrals.show', $token->token))
            ->assertRedirect($campaign->destination_url);

        $this->assertDatabaseHas('clicks', [
            'referral_token_id' => $token->id,
            'country' => 'Philippines',
            'country_code' => 'PH',
            'region' => 'Metro Manila',
            'city' => 'Manila',
        ]);
    }

    public function test_referral_click_location_unknown_for_private_ip(): void
    {
        [$campaign, $token] = $this->createReferralToken();

        $this
            ->withServerVariables(['REMOTE_ADDR' => '192.168.1.10'])
            ->get(route('referrals.show', $token->token))
            ->assertRedirect($campaign->destination_url);

        $this->assertDatabaseHas('clicks', [
            'referral_token_id' => $token->id,
            'ip_address' => '192.168.1.10',
            'country' => null,
            'country_code' => null,
            'region' => null,
        ]);
    }

    public function test_business_campaign_stats_summary_is_only_available_to_campaign_owner(): void
    {
        $business = $this->createBusinessOwner('Owner Co');
        $otherBusiness = $this->createBusinessOwner('Other Co');
        [$campaign] = $this->createReferralToken([
            'business_owner_id' => $business->id,
        ]);

        $this
            ->actingAs($otherBusiness)
            ->getJson(route('business.campaigns.stats-summary', $campaign))
            ->assertForbidden();
    }

    public function test_self_referral_is_blocked(): void
    {
        [$campaign, $token, $owner] = $this->createReferralToken();

        $response = $this
            ->actingAs($owner)
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.20'])
            ->get(route('referrals.show', $token->token));

        $response->assertRedirect($campaign->destination_url);

        $this->assertDatabaseCount('clicks', 0);
        $this->assertSame(0, $campaign->fresh()->click_count);

        $this->assertDatabaseHas('blocked_activities', [
            'type' => 'self_referral',
            'referral_token_id' => $token->id,
            'user_id' => $owner->id,
            'ip_address' => '203.0.113.20',
        ]);

        $this
            ->actingAs($owner)
            ->getJson(route('campaigns.stats-summary', $campaign))
            ->assertOk()
            ->assertJsonPath('click_count', 0)
            ->assertJsonPath('participant_clicks_count', 0);
    }

    public function test_duplicate_click_from_same_ip_is_flagged(): void
    {
        [$campaign, $token] = $this->createReferralToken();

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.30'])
            ->get(route('referrals.show', $token->token))
            ->assertRedirect($campaign->destination_url);

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.30'])
            ->get(route('referrals.show', $token->token))
            ->assertRedirect($campaign->destination_url);

        $this->assertDatabaseCount('clicks', 2);
        $this->assertSame(1, $campaign->fresh()->click_count);

        $flaggedClick = Click::query()
            ->where('referral_token_id', $token->id)
            ->where('is_flagged', true)
            ->first();

        $this->assertNotNull($flaggedClick);
        $this->assertSame('duplicate', $flaggedClick->flag_reason);
    }

    public function test_referral_click_source_is_tracked_and_sanitized(): void
    {
        [$campaign, $token] = $this->createReferralToken();

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.31'])
            ->get(route('referrals.show', ['token' => $token->token, 'source' => 'facebook']))
            ->assertRedirect($campaign->destination_url);

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.32'])
            ->get(route('referrals.show', ['token' => $token->token, 'source' => 'not-real']))
            ->assertRedirect($campaign->destination_url);

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.33'])
            ->get(route('referrals.show', $token->token))
            ->assertRedirect($campaign->destination_url);

        $this->assertDatabaseHas('clicks', [
            'referral_token_id' => $token->id,
            'ip_address' => '203.0.113.31',
            'source' => 'facebook',
        ]);

        $this->assertDatabaseHas('clicks', [
            'referral_token_id' => $token->id,
            'ip_address' => '203.0.113.32',
            'source' => 'direct',
        ]);

        $this->assertDatabaseHas('clicks', [
            'referral_token_id' => $token->id,
            'ip_address' => '203.0.113.33',
            'source' => 'direct',
        ]);
    }

    public function test_unavailable_campaign_referral_redirect_does_not_log_click(): void
    {
        [$campaign, $token] = $this->createReferralToken([
            'expires_at' => now()->subDay(),
        ]);

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.40'])
            ->get(route('referrals.show', $token->token));

        $response->assertRedirect($campaign->destination_url);

        $this->assertDatabaseCount('clicks', 0);
        $this->assertSame(0, $campaign->fresh()->click_count);

        $this->assertDatabaseHas('blocked_activities', [
            'type' => 'unavailable_campaign_click',
            'referral_token_id' => $token->id,
            'user_id' => $token->user_id,
            'ip_address' => '203.0.113.40',
        ]);
    }

    /**
     * @return array{Campaign, ReferralToken, User}
     */
    private function createReferralToken(array $campaignOverrides = []): array
    {
        $owner = User::factory()->create();

        $campaign = Campaign::create(array_merge([
            'brand_name' => 'Northstar Coffee',
            'title' => 'Cold Brew Starter Pack',
            'description' => 'A simple campaign for testing referrals.',
            'category' => 'Food & Drink',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/northstar-cold-brew',
            'status' => 'active',
        ], $campaignOverrides));

        $token = ReferralToken::create([
            'user_id' => $owner->id,
            'campaign_id' => $campaign->id,
            'token' => 'abc123test',
        ]);

        return [$campaign, $token, $owner];
    }

    private function createBusinessOwner(string $companyName = 'Northstar Coffee'): User
    {
        $business = User::factory()->businessOwner()->create();
        $brand = Brand::create(['name' => $companyName, 'business_type' => 'Retail']);

        BusinessProfile::create([
            'user_id' => $business->id,
            'brand_id' => $brand->id,
            'company_name' => $companyName,
            'contact_person_name' => $business->name,
            'industry' => 'Retail',
            'industry_key' => 'retail',
        ]);

        return $business;
    }
}
