<?php

namespace Tests\Feature;

use App\Mail\VerifyEmailCode;
use App\Models\Brand;
use App\Models\BusinessProfile;
use App\Models\Campaign;
use App\Models\Click;
use App\Models\Conversion;
use App\Models\PayoutRequest;
use App\Models\ReferralToken;
use App\Models\Reward;
use App\Models\User;
use App\Services\StripeBillingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BusinessOwnerModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_owner_can_register(): void
    {
        Mail::fake();

        $this->post(route('register'), [
            'account_type' => 'business_owner',
            'first_name' => 'Business',
            'last_name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms_accepted' => true,
        ])->assertRedirect(route('verify.notice'));

        $this->assertDatabaseHas('users', [
            'email' => 'owner@example.com',
            'user_type' => 'business_owner',
            'is_admin' => false,
        ]);

        Mail::assertSent(VerifyEmailCode::class);
    }

    public function test_business_owner_can_complete_profile(): void
    {
        $owner = User::factory()->businessOwner()->create();

        $this
            ->actingAs($owner)
            ->post(route('business.profile.update'), [
                'company_name' => 'Northstar Coffee',
                'contact_person_name' => 'Taylor Smith',
                'website_url' => 'https://example.com',
                'phone' => '555-1000',
                'industry' => 'Food and Drink',
                'description' => 'Coffee products and subscriptions.',
            ])
            ->assertRedirect(route('business.dashboard'));

        $this->assertDatabaseHas('business_profiles', [
            'user_id' => $owner->id,
            'company_name' => 'Northstar Coffee',
            'contact_person_name' => 'Taylor Smith',
        ]);

        $this->assertDatabaseHas('brands', [
            'name' => 'Northstar Coffee',
            'business_type' => 'Food and Drink',
        ]);
    }

    public function test_business_owner_can_create_campaign(): void
    {
        [$owner] = $this->businessOwnerWithProfile();

        $this
            ->actingAs($owner)
            ->post(route('business.campaigns.store'), [
                'title' => 'Cold Brew Starter Pack',
                'description' => 'Promote the starter pack.',
                'category' => 'Food and Drink',
                'reward_amount' => '15.50',
                'destination_url' => 'https://example.com/cold-brew',
                'status' => 'active',
                'expires_at' => null,
            ])
            ->assertRedirect(route('business.campaigns.index'));

        $this->assertDatabaseHas('campaigns', [
            'business_owner_id' => $owner->id,
            'title' => 'Cold Brew Starter Pack',
            'reward_type' => 'flat',
            'reward_amount' => 1550,
            'status' => 'active',
        ]);
    }

    public function test_business_campaign_expiry_date_remains_available_until_end_of_selected_day(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-05-12 12:00:00', config('app.timezone')));

        try {
            [$owner] = $this->businessOwnerWithProfile();

            $this
                ->actingAs($owner)
                ->post(route('business.campaigns.store'), [
                    'title' => 'Same Day Expiry Campaign',
                    'description' => 'This campaign should stay available until the selected day ends.',
                    'category' => 'Food and Drink',
                    'reward_amount' => '15.50',
                    'destination_url' => 'https://example.com/same-day-expiry',
                    'status' => 'active',
                    'expires_at' => '2026-05-12',
                ])
                ->assertRedirect(route('business.campaigns.index'));

            $campaign = Campaign::query()
                ->where('business_owner_id', $owner->id)
                ->where('title', 'Same Day Expiry Campaign')
                ->firstOrFail();

            $this->assertSame('2026-05-12 23:59:59', $campaign->expires_at->format('Y-m-d H:i:s'));
            $this->assertTrue(Campaign::query()->available()->whereKey($campaign->id)->exists());

            $participant = User::factory()->create();

            $this
                ->actingAs($participant)
                ->get(route('campaigns.index', ['search' => 'Same Day Expiry Campaign']))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Campaigns')
                    ->has('searchResults', 1)
                    ->where('searchResults.0.id', $campaign->id)
                );

            $this
                ->actingAs($participant)
                ->from(route('campaigns.show', $campaign->slug ?? $campaign->id))
                ->post(route('campaigns.referral-link.store', $campaign))
                ->assertRedirect(route('campaigns.show', $campaign->slug ?? $campaign->id));

            $this->assertDatabaseHas('referral_tokens', [
                'campaign_id' => $campaign->id,
                'user_id' => $participant->id,
            ]);

            Carbon::setTestNow(Carbon::parse('2026-05-13 00:00:00', config('app.timezone')));

            $this->assertFalse(Campaign::query()->available()->whereKey($campaign->id)->exists());
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_business_owner_can_create_fixed_amount_campaign(): void
    {
        [$owner] = $this->businessOwnerWithProfile();

        $this
            ->actingAs($owner)
            ->post(route('business.campaigns.store'), [
                'title' => 'Fixed Reward Campaign',
                'description' => 'Promote a fixed reward offer.',
                'category' => 'Retail',
                'reward_type' => 'flat',
                'reward_amount' => '14.00',
                'destination_url' => 'https://example.com/fixed',
                'status' => 'active',
                'expires_at' => null,
            ])
            ->assertRedirect(route('business.campaigns.index'));

        $this->assertDatabaseHas('campaigns', [
            'business_owner_id' => $owner->id,
            'title' => 'Fixed Reward Campaign',
            'reward_type' => 'flat',
            'reward_amount' => 1400,
        ]);
    }

    public function test_business_owner_can_create_percentage_campaign(): void
    {
        [$owner] = $this->businessOwnerWithProfile();

        $this
            ->actingAs($owner)
            ->post(route('business.campaigns.store'), [
                'title' => 'Percentage Reward Campaign',
                'description' => 'Promote a percentage reward offer.',
                'category' => 'Retail',
                'reward_type' => 'percentage',
                'reward_amount' => '15.5',
                'destination_url' => 'https://example.com/percentage',
                'status' => 'active',
                'expires_at' => null,
            ])
            ->assertRedirect(route('business.campaigns.index'));

        $this->assertDatabaseHas('campaigns', [
            'business_owner_id' => $owner->id,
            'title' => 'Percentage Reward Campaign',
            'reward_type' => 'percentage',
            'reward_amount' => 1550,
        ]);
    }

    public function test_business_owner_cannot_create_percentage_campaign_above_one_hundred_percent(): void
    {
        [$owner] = $this->businessOwnerWithProfile();

        $this
            ->actingAs($owner)
            ->post(route('business.campaigns.store'), [
                'title' => 'Invalid Percentage Campaign',
                'description' => 'This should be rejected.',
                'category' => 'Retail',
                'reward_type' => 'percentage',
                'reward_amount' => '100.01',
                'destination_url' => 'https://example.com/invalid',
                'status' => 'active',
                'expires_at' => null,
            ])
            ->assertSessionHasErrors('reward_amount');

        $this->assertDatabaseMissing('campaigns', [
            'title' => 'Invalid Percentage Campaign',
        ]);
    }

    public function test_existing_fixed_campaign_displays_reward_and_participant_route_on_business_detail(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile();
        $campaign = $this->campaignForOwner($owner, $profile);

        $this
            ->actingAs($owner)
            ->get(route('business.campaigns.show', $campaign))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Business/Campaigns/Show')
                ->where('campaign.reward_type', 'flat')
                ->where('campaign.reward_display', '$10.00')
                ->where('campaign.business_preview_url', route('business.campaigns.preview', $campaign))
            );
    }

    public function test_business_campaign_preview_is_business_only_and_uses_preview_mode(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile();
        $campaign = $this->campaignForOwner($owner, $profile);

        $this
            ->actingAs($owner)
            ->get(route('business.campaigns.preview', $campaign))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns/Show')
                ->where('businessPreview', true)
                ->where('campaign.id', $campaign->id)
                ->where('campaign.referral_url', null)
            );

        $participant = User::factory()->create();

        $this
            ->actingAs($participant)
            ->get(route('business.campaigns.preview', $campaign))
            ->assertForbidden();
    }

    public function test_business_owner_can_edit_own_campaign(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile();
        $campaign = $this->campaignForOwner($owner, $profile);

        $this
            ->actingAs($owner)
            ->put(route('business.campaigns.update', $campaign), [
                'title' => 'Updated Campaign',
                'description' => 'Updated description.',
                'category' => 'Retail',
                'reward_amount' => '20.00',
                'destination_url' => 'https://example.com/updated',
                'status' => 'paused',
                'expires_at' => null,
            ])
            ->assertRedirect(route('business.campaigns.index'));

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'business_owner_id' => $owner->id,
            'title' => 'Updated Campaign',
            'reward_amount' => 2000,
            'status' => 'paused',
        ]);
    }

    public function test_business_owner_cannot_edit_another_owners_campaign(): void
    {
        [$owner] = $this->businessOwnerWithProfile('Owner One', 'One Co');
        [$otherOwner, $otherProfile] = $this->businessOwnerWithProfile('Owner Two', 'Two Co');
        $campaign = $this->campaignForOwner($otherOwner, $otherProfile);

        $this
            ->actingAs($owner)
            ->put(route('business.campaigns.update', $campaign), [
                'title' => 'Hijacked Campaign',
                'description' => 'Should not work.',
                'category' => 'Retail',
                'reward_amount' => '20.00',
                'destination_url' => 'https://example.com/hijack',
                'status' => 'active',
                'expires_at' => null,
            ])
            ->assertForbidden();
    }

    public function test_business_owner_can_pause_and_resume_own_campaign(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile();
        $campaign = $this->campaignForOwner($owner, $profile);

        $this
            ->actingAs($owner)
            ->patch(route('business.campaigns.status.update', $campaign), [
                'status' => 'paused',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'status' => 'paused',
        ]);

        $this
            ->actingAs($owner)
            ->patch(route('business.campaigns.status.update', $campaign), [
                'status' => 'active',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'status' => 'active',
        ]);
    }

    public function test_business_owner_cannot_update_another_owners_campaign_status(): void
    {
        [$owner] = $this->businessOwnerWithProfile('Owner One', 'One Co');
        [$otherOwner, $otherProfile] = $this->businessOwnerWithProfile('Owner Two', 'Two Co');
        $campaign = $this->campaignForOwner($otherOwner, $otherProfile);

        $this
            ->actingAs($owner)
            ->patch(route('business.campaigns.status.update', $campaign), [
                'status' => 'paused',
            ])
            ->assertForbidden();
    }

    public function test_business_owner_cannot_resume_draft_campaign_from_status_action(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile();
        $campaign = $this->campaignForOwner($owner, $profile);
        $campaign->update(['status' => 'draft']);

        $this
            ->actingAs($owner)
            ->patch(route('business.campaigns.status.update', $campaign), [
                'status' => 'active',
            ])
            ->assertStatus(422);

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'status' => 'draft',
        ]);
    }

    public function test_participant_cannot_access_business_routes(): void
    {
        $participant = User::factory()->create();

        $this
            ->actingAs($participant)
            ->get(route('business.dashboard'))
            ->assertForbidden();
    }

    public function test_business_owner_sees_business_dashboard(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile();
        $campaign = $this->campaignForOwner($owner, $profile);

        $this
            ->actingAs($owner)
            ->get(route('business.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Business/Dashboard')
                ->where('profile.company_name', $profile->company_name)
                ->where('stats.total_campaigns', 1)
                ->where('campaignPerformance.0.title', $campaign->title)
            );
    }

    public function test_business_layout_does_not_include_participant_tab(): void
    {
        $layout = file_get_contents(resource_path('js/Layouts/BusinessLayout.jsx'));

        $this->assertStringNotContainsString('Participant', $layout);
        $this->assertStringNotContainsString("label: 'Messages'", $layout);
        $this->assertStringContainsString('My Campaigns', $layout);
        $this->assertStringContainsString('Create Campaign', $layout);
    }

    public function test_business_owner_dashboard_only_includes_own_campaigns(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile('Owner One', 'One Co');
        [$otherOwner, $otherProfile] = $this->businessOwnerWithProfile('Owner Two', 'Two Co');
        $ownCampaign = $this->campaignForOwner($owner, $profile);
        $otherCampaign = $this->campaignForOwner($otherOwner, $otherProfile);

        $this
            ->actingAs($owner)
            ->get(route('business.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Business/Dashboard')
                ->where('stats.total_campaigns', 1)
                ->where('campaignPerformance.0.title', $ownCampaign->title)
                ->missing('campaignPerformance.1')
            )
            ->assertDontSee($otherCampaign->title, false);
    }

    public function test_admin_access_is_not_broken(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertRedirect(route('admin.campaigns.index'));
    }

    public function test_guest_homepage_renders_landing_page(): void
    {
        $this
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Landing/Index')
            );
    }

    public function test_authenticated_root_redirects_by_role(): void
    {
        $admin = User::factory()->admin()->create();
        [$owner] = $this->businessOwnerWithProfile('Root Owner', 'Root Co');
        $participant = User::factory()->create();

        $this->actingAs($admin)->get('/')->assertRedirect(route('admin.dashboard'));
        $this->actingAs($owner)->get('/')->assertRedirect(route('business.dashboard'));
        $this->actingAs($participant)->get('/')->assertRedirect(route('dashboard'));
    }

    public function test_login_redirects_by_role(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'admin-login@example.com',
            'password' => 'password123',
        ]);
        [$owner] = $this->businessOwnerWithProfile('Owner Login', 'Login Co');
        $owner->update([
            'email' => 'owner-login@example.com',
            'password' => 'password123',
        ]);
        $participant = User::factory()->create([
            'email' => 'participant-login@example.com',
            'password' => 'password123',
        ]);

        $this->post(route('login'), [
            'email' => $admin->email,
            'password' => 'password123',
        ])->assertRedirect(route('admin.dashboard'));

        $this->post(route('logout'));

        $this->post(route('login'), [
            'email' => $owner->email,
            'password' => 'password123',
        ])->assertRedirect(route('business.dashboard'));

        $this->post(route('logout'));

        $this->post(route('login'), [
            'email' => $participant->email,
            'password' => 'password123',
        ])->assertRedirect(route('dashboard'));
    }

    public function test_admin_login_ignores_stale_client_intended_url(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'admin-intended@example.com',
            'password' => 'password123',
        ]);

        $this
            ->withSession(['url.intended' => route('dashboard')])
            ->post(route('login'), [
                'email' => $admin->email,
                'password' => 'password123',
            ])
            ->assertRedirect(route('admin.dashboard'));
    }

    public function test_business_owner_with_incomplete_profile_redirects_to_profile_completion(): void
    {
        $owner = User::factory()->businessOwner()->create([
            'email' => 'incomplete-owner@example.com',
            'password' => 'password123',
        ]);

        $this->post(route('login'), [
            'email' => $owner->email,
            'password' => 'password123',
        ])->assertRedirect(route('business.profile.edit'));
    }

    public function test_business_owner_stats_only_include_own_campaign_data(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile('Owner One', 'One Co');
        [$otherOwner, $otherProfile] = $this->businessOwnerWithProfile('Owner Two', 'Two Co');
        $participant = User::factory()->create();
        $campaign = $this->campaignForOwner($owner, $profile);
        $otherCampaign = $this->campaignForOwner($otherOwner, $otherProfile);
        $token = ReferralToken::create([
            'user_id' => $participant->id,
            'campaign_id' => $campaign->id,
            'token' => 'own-token',
        ]);
        $otherToken = ReferralToken::create([
            'user_id' => $participant->id,
            'campaign_id' => $otherCampaign->id,
            'token' => 'other-token',
        ]);
        $conversion = Conversion::create([
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'referral_token_id' => $token->id,
            'amount' => 5000,
            'status' => 'verified',
            'verified_at' => now(),
        ]);
        $otherConversion = Conversion::create([
            'campaign_id' => $otherCampaign->id,
            'user_id' => $participant->id,
            'referral_token_id' => $otherToken->id,
            'amount' => 8000,
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        Click::create([
            'referral_token_id' => $token->id,
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'ip_address' => '127.0.0.1',
            'is_flagged' => false,
        ]);
        Click::create([
            'referral_token_id' => $token->id,
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'ip_address' => '127.0.0.1',
            'is_flagged' => true,
            'flag_reason' => 'duplicate_click',
        ]);
        Click::create([
            'referral_token_id' => $otherToken->id,
            'campaign_id' => $otherCampaign->id,
            'user_id' => $participant->id,
            'ip_address' => '10.0.0.2',
            'is_flagged' => false,
        ]);
        Reward::create([
            'conversion_id' => $conversion->id,
            'user_id' => $participant->id,
            'campaign_id' => $campaign->id,
            'amount' => 1500,
            'status' => 'pending',
        ]);
        Reward::create([
            'conversion_id' => $otherConversion->id,
            'user_id' => $participant->id,
            'campaign_id' => $otherCampaign->id,
            'amount' => 8000,
            'status' => 'pending',
        ]);

        $this
            ->actingAs($owner)
            ->get(route('business.campaigns.stats', $campaign))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Business/Campaigns/Stats')
                ->where('stats.total_clicks', 2)
                ->where('stats.unique_clicks', 1)
                ->where('stats.flagged_clicks', 1)
                ->where('stats.conversions', 1)
                ->where('stats.total_rewards_generated', 1500)
                ->missing('recentClicks.2')
            );

        $this
            ->actingAs($owner)
            ->get(route('business.campaigns.stats', $otherCampaign))
            ->assertForbidden();
    }

    public function test_business_owner_can_approve_own_payout_request_with_saved_card(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile('Owner One', 'One Co');
        $participant = User::factory()->create();
        $campaign = $this->campaignForOwner($owner, $profile);
        $reward = $this->rewardForCampaign($participant, $campaign, 1500, 'processing');
        $payoutRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'amount' => 1500,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        $payoutRequest->rewards()->attach($reward->id);
        $profile->update([
            'stripe_customer_id' => 'cus_test_123',
            'stripe_payment_method_id' => 'pm_test_123',
            'stripe_card_brand' => 'visa',
            'stripe_card_last4' => '4242',
            'stripe_billing_ready' => true,
        ]);

        $this->mock(StripeBillingService::class, function ($mock) {
            $mock->shouldReceive('chargeSavedPaymentMethod')
                ->once()
                ->andReturn([
                    'id' => 'pi_test_123',
                    'status' => 'succeeded',
                ]);
        });

        $this
            ->actingAs($owner)
            ->post(route('business.payout-requests.approve', $payoutRequest))
            ->assertRedirect()
            ->assertSessionHas('success', 'Payout approved and business card charged.');

        $this->assertDatabaseHas('payout_requests', [
            'id' => $payoutRequest->id,
            'status' => 'approved',
            'business_approved_by' => $owner->id,
            'stripe_payment_intent_id' => 'pi_test_123',
            'stripe_payment_status' => 'succeeded',
        ]);
    }

    public function test_business_owner_can_view_only_own_payout_requests(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile('Owner One', 'One Co');
        [$otherOwner, $otherProfile] = $this->businessOwnerWithProfile('Owner Two', 'Two Co');
        $participant = User::factory()->create();
        $ownCampaign = $this->campaignForOwner($owner, $profile);
        $otherCampaign = $this->campaignForOwner($otherOwner, $otherProfile);
        $ownReward = $this->rewardForCampaign($participant, $ownCampaign, 1500, 'processing');
        $otherReward = $this->rewardForCampaign($participant, $otherCampaign, 2500, 'processing');
        $ownRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'amount' => 1500,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        $otherRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'amount' => 2500,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        $ownRequest->rewards()->attach($ownReward->id);
        $otherRequest->rewards()->attach($otherReward->id);

        $this
            ->actingAs($owner)
            ->get(route('business.payout-requests.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Business/PayoutRequests/Index')
                ->where('payoutRequests.0.id', $ownRequest->id)
                ->missing('payoutRequests.1')
            );
    }

    public function test_business_owner_cannot_approve_payout_without_saved_card(): void
    {
        [$owner, $profile] = $this->businessOwnerWithProfile('Owner One', 'One Co');
        $participant = User::factory()->create();
        $campaign = $this->campaignForOwner($owner, $profile);
        $reward = $this->rewardForCampaign($participant, $campaign, 1500, 'processing');
        $payoutRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'amount' => 1500,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        $payoutRequest->rewards()->attach($reward->id);

        $this
            ->actingAs($owner)
            ->post(route('business.payout-requests.approve', $payoutRequest))
            ->assertRedirect()
            ->assertSessionHas('error', 'Add a card before approving payout requests.');

        $this->assertDatabaseHas('payout_requests', [
            'id' => $payoutRequest->id,
            'status' => 'pending',
            'stripe_payment_intent_id' => null,
        ]);
    }

    public function test_business_owner_cannot_approve_another_business_payout_request(): void
    {
        [$owner] = $this->businessOwnerWithProfile('Owner One', 'One Co');
        [$otherOwner, $otherProfile] = $this->businessOwnerWithProfile('Owner Two', 'Two Co');
        $participant = User::factory()->create();
        $campaign = $this->campaignForOwner($otherOwner, $otherProfile);
        $reward = $this->rewardForCampaign($participant, $campaign, 1500, 'processing');
        $payoutRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'amount' => 1500,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        $payoutRequest->rewards()->attach($reward->id);
        $owner->businessProfile->update([
            'stripe_customer_id' => 'cus_test_123',
            'stripe_payment_method_id' => 'pm_test_123',
            'stripe_billing_ready' => true,
        ]);

        $this
            ->actingAs($owner)
            ->post(route('business.payout-requests.approve', $payoutRequest))
            ->assertForbidden();

        $this->assertDatabaseHas('payout_requests', [
            'id' => $payoutRequest->id,
            'status' => 'pending',
            'stripe_payment_intent_id' => null,
        ]);
    }

    private function businessOwnerWithProfile(string $ownerName = 'Business Owner', string $companyName = 'Northstar Coffee'): array
    {
        $owner = User::factory()->businessOwner()->create([
            'name' => $ownerName,
        ]);
        $brand = Brand::create([
            'name' => $companyName,
        ]);
        $profile = BusinessProfile::create([
            'user_id' => $owner->id,
            'brand_id' => $brand->id,
            'company_name' => $companyName,
            'contact_person_name' => $ownerName,
        ]);

        return [$owner, $profile];
    }

    private function campaignForOwner(User $owner, BusinessProfile $profile): Campaign
    {
        return Campaign::create([
            'created_by' => $owner->id,
            'business_owner_id' => $owner->id,
            'brand_id' => $profile->brand_id,
            'brand_name' => $profile->company_name,
            'title' => $profile->company_name.' Campaign',
            'description' => 'A business campaign.',
            'category' => 'Retail',
            'reward_amount' => 1000,
            'destination_url' => 'https://example.com',
            'status' => 'active',
        ]);
    }

    private function rewardForCampaign(User $participant, Campaign $campaign, int $amount, string $status): Reward
    {
        $conversion = Conversion::create([
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'amount' => $amount,
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        return Reward::create([
            'conversion_id' => $conversion->id,
            'user_id' => $participant->id,
            'campaign_id' => $campaign->id,
            'amount' => $amount,
            'status' => $status,
        ]);
    }
}
