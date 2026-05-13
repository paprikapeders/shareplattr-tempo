<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CampaignBrandStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_campaign_detail_exposes_new_brand_without_fake_rating(): void
    {
        $user = User::factory()->create();
        $brand = Brand::create(['name' => 'Luma Pantry']);
        $campaign = $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Luma Starter Box',
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.show', $campaign->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns/Show')
                ->where('campaign.brand_stats.campaigns_launched', 1)
                ->where('campaign.brand_stats.average_rating', null)
            );
    }

    public function test_public_campaign_detail_exposes_real_brand_campaign_count(): void
    {
        $user = User::factory()->create();
        $brand = Brand::create(['name' => 'Luma Pantry']);
        $campaign = $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Luma Starter Box',
        ]);
        $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Luma Loyalty Launch',
            'status' => 'paused',
        ]);
        $this->createCampaign([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Luma Draft Campaign',
            'status' => 'draft',
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.show', $campaign->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns/Show')
                ->where('campaign.brand_stats.campaigns_launched', 2)
                ->where('campaign.brand_stats.average_rating', null)
            );
    }

    public function test_public_campaign_detail_omits_stats_for_unlinked_legacy_brand(): void
    {
        $user = User::factory()->create();
        $campaign = $this->createCampaign([
            'brand_name' => 'Legacy Brand',
            'title' => 'Legacy Starter Box',
        ]);

        $this
            ->actingAs($user)
            ->get(route('campaigns.show', $campaign->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns/Show')
                ->where('campaign.brand_stats.campaigns_launched', 0)
                ->where('campaign.brand_stats.average_rating', null)
            );
    }

    private function createCampaign(array $overrides = []): Campaign
    {
        return Campaign::create(array_merge([
            'brand_name' => 'Luma Pantry',
            'title' => 'Luma Pantry Starter Box',
            'description' => 'A public campaign detail test campaign.',
            'category' => 'Food',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/luma-pantry',
            'status' => 'active',
            'expires_at' => null,
        ], $overrides));
    }
}
