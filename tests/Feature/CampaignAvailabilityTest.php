<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Campaign;
use App\Models\ReferralToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CampaignAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_expired_campaign_is_hidden_from_campaign_list(): void
    {
        $user = User::factory()->create();
        $availableCampaign = $this->createCampaign(['title' => 'Available Campaign']);
        $expiredCampaign = $this->createCampaign([
            'title' => 'Expired Campaign',
            'expires_at' => now()->subDay(),
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 1)
                ->where('campaigns.0.id', $availableCampaign->id)
            );

        $this->assertDatabaseHas('campaigns', [
            'id' => $expiredCampaign->id,
            'title' => 'Expired Campaign',
        ]);
    }

    public function test_expired_campaign_detail_is_not_accessible(): void
    {
        $user = User::factory()->create();
        $expiredCampaign = $this->createCampaign([
            'expires_at' => now()->subDay(),
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.show', $expiredCampaign))
            ->assertNotFound();
    }

    public function test_referral_generation_is_blocked_for_expired_campaign(): void
    {
        $user = User::factory()->create();
        $expiredCampaign = $this->createCampaign([
            'expires_at' => now()->subDay(),
        ]);

        $this
            ->actingAs($user)
            ->post(route('campaigns.referral-link.store', $expiredCampaign))
            ->assertRedirect(route('campaigns.index'))
            ->assertSessionHas('error', 'That campaign is no longer available.');

        $this->assertDatabaseCount('referral_tokens', 0);
    }

    public function test_campaign_detail_renders_custom_share_message_after_referral_link_exists(): void
    {
        $user = User::factory()->create();
        $campaign = $this->createCampaign([
            'brand_name' => 'Northstar Coffee',
            'title' => 'Cold Brew Starter Pack',
            'share_message_template' => 'Share {campaign_title} from {business_name}: {referral_link}',
        ]);

        $token = ReferralToken::create([
            'user_id' => $user->id,
            'campaign_id' => $campaign->id,
            'token' => 'customshare',
        ]);

        $referralUrl = route('referrals.show', $token->token);

        $this
            ->actingAs($user)
            ->get(route('campaigns.show', $campaign->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns/Show')
                ->where('campaign.share_message_template', 'Share {campaign_title} from {business_name}: {referral_link}')
                ->where('campaign.referral_url', $referralUrl)
                ->where('campaign.share_message', 'Share Cold Brew Starter Pack from Northstar Coffee: '.$referralUrl)
            );
    }

    public function test_campaign_detail_uses_fallback_share_message_when_template_is_empty(): void
    {
        $user = User::factory()->create();
        $campaign = $this->createCampaign([
            'brand_name' => 'Northstar Coffee',
            'title' => 'Cold Brew Starter Pack',
            'share_message_template' => null,
        ]);

        $token = ReferralToken::create([
            'user_id' => $user->id,
            'campaign_id' => $campaign->id,
            'token' => 'fallbackshare',
        ]);

        $referralUrl = route('referrals.show', $token->token);

        $this
            ->actingAs($user)
            ->get(route('campaigns.show', $campaign->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns/Show')
                ->where('campaign.share_message', "Hey! I've been using Northstar Coffee and thought you'd love it.\n\nUse my link to get started: ".$referralUrl)
            );
    }

    public function test_instagram_share_uses_dedicated_clipboard_first_handler(): void
    {
        $page = file_get_contents(resource_path('js/Pages/Campaigns/Show.jsx'));

        $this->assertStringContainsString('const handleInstagramShare = async () => {', $page);
        $this->assertStringContainsString("const instagramAppUrl = 'instagram://app';", $page);
        $this->assertStringContainsString("const instagramWebUrl = 'https://www.instagram.com/';", $page);
        $this->assertStringContainsString("label: 'Copy message & open Instagram'", $page);
        $this->assertStringNotContainsString('instagram.com/share', $page);
        $this->assertStringNotContainsString('instagram.com/intent', $page);
    }

    public function test_email_share_uses_encoded_mailto_with_composed_message(): void
    {
        $page = file_get_contents(resource_path('js/Pages/Campaigns/Show.jsx'));

        $this->assertStringContainsString('function EmailIcon', $page);
        $this->assertStringContainsString('const handleEmailShare = () => {', $page);
        $this->assertStringContainsString("const subject = emailSubject();", $page);
        $this->assertStringContainsString("const body = composedMessage('email');", $page);
        $this->assertStringContainsString('mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}', $page);
        $this->assertStringContainsString("label: 'Share by Email'", $page);
    }

    public function test_admin_conversion_rejects_expired_campaign(): void
    {
        $admin = User::factory()->admin()->create();
        $participant = User::factory()->create();
        $expiredCampaign = $this->createCampaign([
            'expires_at' => now()->subDay(),
        ]);

        $this
            ->actingAs($admin)
            ->from(route('admin.conversions.create'))
            ->post(route('admin.conversions.store'), [
                'campaign_id' => $expiredCampaign->id,
                'user_id' => $participant->id,
                'amount' => '49.99',
                'amount_type' => 'dollars',
                'notes' => null,
            ])
            ->assertRedirect(route('admin.conversions.create'))
            ->assertSessionHasErrors('campaign_id');

        $this->assertDatabaseCount('conversions', 0);
        $this->assertDatabaseCount('rewards', 0);
    }

    public function test_referral_redirect_does_not_log_click_for_expired_campaign(): void
    {
        $owner = User::factory()->create();
        $expiredCampaign = $this->createCampaign([
            'expires_at' => now()->subDay(),
        ]);

        $token = ReferralToken::create([
            'user_id' => $owner->id,
            'campaign_id' => $expiredCampaign->id,
            'token' => 'expiredtoken',
        ]);

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.50'])
            ->get(route('referrals.show', $token->token))
            ->assertRedirect($expiredCampaign->destination_url);

        $this->assertDatabaseCount('clicks', 0);
        $this->assertSame(0, $expiredCampaign->fresh()->click_count);
        $this->assertDatabaseHas('blocked_activities', [
            'type' => 'unavailable_campaign_click',
            'referral_token_id' => $token->id,
            'user_id' => $owner->id,
            'ip_address' => '203.0.113.50',
        ]);
    }

    public function test_marketplace_search_matches_campaign_title(): void
    {
        $user = User::factory()->create();
        $matchingCampaign = $this->createCampaign(['title' => 'Hims & Hers Affiliate Program']);
        $this->createCampaign(['title' => 'Coffee Starter Pack']);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['search' => 'hims']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 1)
                ->where('campaigns.0.id', $matchingCampaign->id)
                ->where('filters.search', 'hims')
            );
    }

    public function test_marketplace_search_matches_related_brand_name(): void
    {
        $user = User::factory()->create();
        $brand = Brand::create(['name' => 'Luma Pantry']);
        $matchingCampaign = $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => 'Legacy Brand Name',
            'title' => 'Weekly Grocery Rewards',
        ]);
        $this->createCampaign(['brand_name' => 'Northstar Coffee', 'title' => 'Coffee Starter Pack']);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['search' => 'luma pantry']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 1)
                ->where('campaigns.0.id', $matchingCampaign->id)
            );
    }

    public function test_marketplace_search_stays_limited_to_available_campaigns(): void
    {
        $user = User::factory()->create();
        $availableCampaign = $this->createCampaign(['title' => 'Active Hims Campaign']);
        $this->createCampaign([
            'title' => 'Paused Hims Campaign',
            'status' => 'paused',
        ]);
        $this->createCampaign([
            'title' => 'Expired Hims Campaign',
            'expires_at' => now()->subDay(),
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['search' => 'hims']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 1)
                ->where('campaigns.0.id', $availableCampaign->id)
            );
    }

    public function test_marketplace_category_filter_and_keyword_search_work_together(): void
    {
        $user = User::factory()->create();
        $matchingCampaign = $this->createCampaign([
            'title' => 'Luma Pantry Rewards',
            'category' => 'Food',
        ]);
        $this->createCampaign([
            'title' => 'Luma Pantry Finance Rewards',
            'category' => 'Finance',
        ]);
        $this->createCampaign([
            'title' => 'Different Food Campaign',
            'category' => 'Food',
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['search' => 'luma', 'category' => 'Food']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 1)
                ->where('campaigns.0.id', $matchingCampaign->id)
                ->where('filters.search', 'luma')
                ->where('filters.category', 'Food')
            );
    }

    public function test_marketplace_category_filter_includes_full_predefined_category_list(): void
    {
        $user = User::factory()->create();
        $matchingCampaign = $this->createCampaign([
            'title' => 'Launch Campaign',
            'category' => 'Product Launch',
            'category_key' => 'product_launch',
        ]);
        $this->createCampaign([
            'title' => 'Other Campaign',
            'category' => 'Other',
            'category_key' => 'other',
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->where('categories.0.value', 'all')
                ->where('categories.0.label', 'All Categories')
                ->where('categories.1.value', 'product_launch')
                ->where('categories.1.label', 'Product Launch')
                ->where('categories.16.value', 'other')
                ->where('categories.16.label', 'Other')
            );

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['category' => 'product_launch']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 1)
                ->where('campaigns.0.id', $matchingCampaign->id)
                ->where('filters.category', 'product_launch')
            );
    }

    public function test_marketplace_category_filter_supports_legacy_and_other_categories(): void
    {
        $user = User::factory()->create();
        $legacyCampaign = $this->createCampaign([
            'title' => 'Fintech Legacy Campaign',
            'category' => 'Fintech',
            'category_key' => null,
            'category_other' => null,
        ]);
        $customCampaign = $this->createCampaign([
            'title' => 'Campus Ambassador Campaign',
            'category' => 'Campus Ambassadors',
            'category_key' => 'other',
            'category_other' => 'Campus Ambassadors',
        ]);
        $this->createCampaign([
            'title' => 'Launch Campaign',
            'category' => 'Product Launch',
            'category_key' => 'product_launch',
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->where('categories.17.value', 'legacy:Campus Ambassadors')
                ->where('categories.17.label', 'Campus Ambassadors')
                ->where('categories.18.value', 'legacy:Fintech')
                ->where('categories.18.label', 'Fintech')
            );

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['category' => 'legacy:Fintech']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 1)
                ->where('campaigns.0.id', $legacyCampaign->id)
                ->where('filters.category', 'legacy:Fintech')
            );

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['category' => 'other']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 2)
                ->where('campaigns.1.id', $customCampaign->id)
            );
    }

    private function createCampaign(array $overrides = []): Campaign
    {
        return Campaign::create(array_merge([
            'brand_name' => 'Northstar Coffee',
            'title' => 'Cold Brew Starter Pack',
            'description' => 'A simple campaign for testing availability.',
            'category' => 'Food & Drink',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/northstar-cold-brew',
            'status' => 'active',
            'expires_at' => null,
        ], $overrides));
    }
}
