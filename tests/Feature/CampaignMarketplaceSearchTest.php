<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CampaignMarketplaceSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_exact_campaign_title_search_returns_available_campaign(): void
    {
        $user = User::factory()->create();
        $brand = Brand::create(['name' => 'Luma Pantry']);
        $starterBox = $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => 'Luma Pantry',
            'title' => 'Luma Pantry Starter Box',
        ]);
        $campaign = $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => 'Luma Pantry',
            'title' => 'Luma Pantry Starter Box 2',
        ]);
        $this->createCampaign(['title' => 'Northstar Coffee Starter Box']);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['search' => 'Luma Pantry Starter Box 2']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 1)
                ->where('campaigns.0.id', $campaign->id)
                ->where('campaigns.0.title', 'Luma Pantry Starter Box 2')
                ->has('searchResults', 1)
                ->where('searchResults.0.id', $campaign->id)
                ->where('searchResults.0.title', 'Luma Pantry Starter Box 2')
                ->where('filters.search', 'Luma Pantry Starter Box 2')
            );

        $this->assertNotSame($starterBox->id, $campaign->id);
    }

    public function test_partial_campaign_title_search_returns_numbered_starter_box_campaign(): void
    {
        $user = User::factory()->create();
        $starterBox = $this->createCampaign(['title' => 'Luma Pantry Starter Box']);
        $starterBoxTwo = $this->createCampaign(['title' => 'Luma Pantry Starter Box 2']);
        $this->createCampaign(['title' => 'Luma Pantry Rewards']);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['search' => 'Starter Box 2']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('searchResults', 1)
                ->where('searchResults.0.id', $starterBoxTwo->id)
                ->where('filters.search', 'Starter Box 2')
            );

        $this->assertNotSame($starterBox->id, $starterBoxTwo->id);
    }

    public function test_partial_starter_box_search_returns_both_luma_starter_box_campaigns(): void
    {
        $user = User::factory()->create();
        $starterBox = $this->createCampaign(['title' => 'Luma Pantry Starter Box']);
        $starterBoxTwo = $this->createCampaign(['title' => 'Luma Pantry Starter Box 2']);
        $this->createCampaign(['title' => 'Another Luma Campaign']);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['search' => 'Starter Box']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('searchResults', 2)
                ->where('searchResults.0.id', $starterBoxTwo->id)
                ->where('searchResults.1.id', $starterBox->id)
            );
    }

    public function test_brand_name_search_returns_multiple_available_campaigns_for_same_brand(): void
    {
        $user = User::factory()->create();
        $brand = Brand::create(['name' => 'Luma Pantry']);
        $starterBox = $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => 'Legacy Brand',
            'title' => 'Luma Pantry Starter Box',
        ]);
        $starterBoxTwo = $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => 'Legacy Brand',
            'title' => 'Luma Pantry Starter Box 2',
        ]);
        $anotherLumaCampaign = $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => 'Legacy Brand',
            'title' => 'Another Luma Campaign',
        ]);
        $this->createCampaign(['brand_name' => 'Northstar Coffee', 'title' => 'Coffee Starter Box']);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['search' => 'Luma Pantry']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('searchResults', 3)
                ->where('searchResults.0.id', $starterBoxTwo->id)
                ->where('searchResults.1.id', $starterBox->id)
                ->where('searchResults.2.id', $anotherLumaCampaign->id)
            );
    }

    public function test_marketplace_search_excludes_draft_paused_and_expired_matches(): void
    {
        $user = User::factory()->create();
        $campaign = $this->createCampaign(['title' => 'Luma Pantry Starter Box 2']);
        $this->createCampaign([
            'title' => 'Draft Luma Pantry Starter Box 2',
            'status' => 'draft',
        ]);
        $this->createCampaign([
            'title' => 'Paused Luma Pantry Starter Box 2',
            'status' => 'paused',
        ]);
        $this->createCampaign([
            'title' => 'Expired Luma Pantry Starter Box 2',
            'expires_at' => now()->subDay(),
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.index', ['search' => 'Luma Pantry Starter Box 2']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('searchResults', 1)
                ->where('searchResults.0.id', $campaign->id)
            );
    }

    private function createCampaign(array $overrides = []): Campaign
    {
        return Campaign::create(array_merge([
            'brand_name' => 'Luma Pantry',
            'title' => 'Luma Pantry Starter Box',
            'description' => 'A marketplace search test campaign.',
            'category' => 'Food',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/luma-pantry',
            'status' => 'active',
            'expires_at' => null,
        ], $overrides));
    }
}
