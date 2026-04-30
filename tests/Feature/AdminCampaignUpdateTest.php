<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
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

    public function test_campaign_banner_update_stores_unique_public_path_and_removes_old_file(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $brand = Brand::create([
            'name' => 'Northstar Coffee',
        ]);
        $oldBannerPath = 'campaign-banners/old-banner.jpg';

        Storage::disk('public')->put($oldBannerPath, 'old banner');

        $campaign = Campaign::create([
            'created_by' => $admin->id,
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Cold Brew Starter Pack',
            'description' => 'A campaign before editing.',
            'category' => 'Food & Drink',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/cold-brew',
            'campaign_banner' => $oldBannerPath,
            'status' => 'active',
            'expires_at' => null,
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.campaigns.update', $campaign), [
                'brand_id' => $brand->id,
                'title' => 'Cold Brew Starter Pack Updated',
                'description' => 'A campaign after editing.',
                'category' => 'Food & Drink',
                'reward_amount' => '15.50',
                'destination_url' => 'https://example.com/cold-brew-updated',
                'campaign_banner' => UploadedFile::fake()->createWithContent(
                    'updated-banner.png',
                    base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='),
                ),
                'status' => 'inactive',
                'expires_at' => null,
            ])
            ->assertRedirect(route('admin.campaigns.index'));

        $newBannerPath = $campaign->fresh()->campaign_banner;

        $this->assertNotSame($oldBannerPath, $newBannerPath);
        $this->assertStringStartsWith('campaign-banners/', $newBannerPath);
        $this->assertStringNotContainsString('/var/www', $newBannerPath);
        $this->assertStringNotContainsString('/storage/', $newBannerPath);

        Storage::disk('public')->assertExists($newBannerPath);
        Storage::disk('public')->assertMissing($oldBannerPath);
    }

    public function test_campaign_pages_expose_campaign_banner_column_and_cache_busted_public_url(): void
    {
        $user = User::factory()->create();
        $brand = Brand::create([
            'name' => 'Northstar Coffee',
        ]);
        $campaign = Campaign::create([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Cold Brew Starter Pack',
            'description' => 'A public campaign with a banner.',
            'category' => 'Food & Drink',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/cold-brew',
            'campaign_banner' => 'campaign-banners/current-banner.jpg',
            'status' => 'active',
            'expires_at' => null,
        ]);
        $expectedUrl = Storage::disk('public')->url($campaign->campaign_banner).'?v='.$campaign->updated_at->timestamp;

        $this
            ->actingAs($user)
            ->get(route('campaigns.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->where('campaigns.0.campaign_banner', $campaign->campaign_banner)
                ->where('campaigns.0.campaign_banner_url', $expectedUrl)
            );

        $this
            ->actingAs($user)
            ->get(route('campaigns.show', $campaign->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns/Show')
                ->where('campaign.campaign_banner', $campaign->campaign_banner)
                ->where('campaign.campaign_banner_url', $expectedUrl)
            );
    }
}
