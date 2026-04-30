<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCampaignUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_campaign_with_put_request(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create([
            'name' => 'Northstar Coffee',
        ]);
        $campaign = Campaign::create([
            'created_by' => $admin->id,
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Cold Brew Starter Pack',
            'description' => 'A campaign before editing.',
            'category' => 'Food & Drink',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/cold-brew',
            'status' => 'active',
            'expires_at' => null,
        ]);

        $this
            ->actingAs($admin)
            ->put(route('admin.campaigns.update', $campaign), [
                'brand_id' => $brand->id,
                'title' => 'Cold Brew Starter Pack Updated',
                'description' => 'A campaign after editing.',
                'category' => 'Food & Drink',
                'reward_amount' => '15.50',
                'destination_url' => 'https://example.com/cold-brew-updated',
                'status' => 'inactive',
                'expires_at' => null,
            ])
            ->assertRedirect(route('admin.campaigns.index'))
            ->assertSessionHas('success', 'Campaign updated.');

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'title' => 'Cold Brew Starter Pack Updated',
            'reward_amount' => 1550,
            'status' => 'inactive',
        ]);
    }
}
