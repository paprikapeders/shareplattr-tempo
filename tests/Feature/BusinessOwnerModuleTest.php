<?php

namespace Tests\Feature;

use App\Mail\VerifyEmailCode;
use App\Models\Brand;
use App\Models\BusinessProfile;
use App\Models\Campaign;
use App\Models\Click;
use App\Models\Conversion;
use App\Models\ReferralToken;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            'reward_amount' => 1550,
            'status' => 'active',
        ]);
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
}
