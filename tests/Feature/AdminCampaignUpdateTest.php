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

    private const DUPLICATE_TITLE_MESSAGE = 'A campaign with this title already exists for this brand.';

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

    public function test_campaign_banner_rejects_files_over_two_megabytes(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create([
            'name' => 'Northstar Coffee',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.campaigns.store'), [
                'brand_id' => $brand->id,
                'title' => 'Large Banner Campaign',
                'description' => 'A campaign with an oversized banner.',
                'category' => 'Food & Drink',
                'reward_amount' => '15.50',
                'destination_url' => 'https://example.com/large-banner',
                'campaign_banner' => UploadedFile::fake()->createWithContent(
                    'large-banner.png',
                    base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=')
                        .str_repeat('a', 2049 * 1024),
                ),
                'status' => 'active',
                'expires_at' => null,
            ])
            ->assertSessionHasErrors('campaign_banner');
    }

    public function test_admin_cannot_create_duplicate_campaign_title_for_same_brand(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create([
            'name' => 'Northstar Coffee',
        ]);

        Campaign::create($this->campaignAttributes($admin, $brand, [
            'title' => 'Business Cards',
        ]));

        $this
            ->actingAs($admin)
            ->post(route('admin.campaigns.store'), $this->campaignRequestData($brand, [
                'title' => 'Business   Cards',
            ]))
            ->assertSessionHasErrors([
                'title' => self::DUPLICATE_TITLE_MESSAGE,
            ]);

        $this->assertSame(1, Campaign::count());
    }

    public function test_admin_can_create_same_campaign_title_under_different_brand(): void
    {
        $admin = User::factory()->admin()->create();
        $firstBrand = Brand::create([
            'name' => 'Northstar Coffee',
        ]);
        $secondBrand = Brand::create([
            'name' => 'Summit Studio',
        ]);

        Campaign::create($this->campaignAttributes($admin, $firstBrand, [
            'title' => 'Business Cards',
        ]));

        $this
            ->actingAs($admin)
            ->post(route('admin.campaigns.store'), $this->campaignRequestData($secondBrand, [
                'title' => 'Business Cards',
            ]))
            ->assertRedirect(route('admin.campaigns.index'))
            ->assertSessionHas('success', 'Campaign created.');

        $this->assertDatabaseHas('campaigns', [
            'brand_id' => $secondBrand->id,
            'title' => 'Business Cards',
            'normalized_title' => 'business cards',
        ]);
    }

    public function test_admin_can_update_campaign_without_failing_on_its_own_title(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create([
            'name' => 'Northstar Coffee',
        ]);
        $campaign = Campaign::create($this->campaignAttributes($admin, $brand, [
            'title' => 'Business Cards',
        ]));

        $this
            ->actingAs($admin)
            ->put(route('admin.campaigns.update', $campaign), $this->campaignRequestData($brand, [
                'title' => 'Business   Cards',
            ]))
            ->assertRedirect(route('admin.campaigns.index'))
            ->assertSessionHas('success', 'Campaign updated.');

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'title' => 'Business   Cards',
            'normalized_title' => 'business cards',
        ]);
    }

    public function test_admin_cannot_update_campaign_to_duplicate_another_campaign_title_in_same_brand(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create([
            'name' => 'Northstar Coffee',
        ]);
        Campaign::create($this->campaignAttributes($admin, $brand, [
            'title' => 'Business Cards',
        ]));
        $campaign = Campaign::create($this->campaignAttributes($admin, $brand, [
            'title' => 'Window Decals',
            'destination_url' => 'https://example.com/window-decals',
        ]));

        $this
            ->actingAs($admin)
            ->put(route('admin.campaigns.update', $campaign), $this->campaignRequestData($brand, [
                'title' => 'business cards',
            ]))
            ->assertSessionHasErrors([
                'title' => self::DUPLICATE_TITLE_MESSAGE,
            ]);

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'title' => 'Window Decals',
            'normalized_title' => 'window decals',
        ]);
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

    private function campaignAttributes(User $admin, Brand $brand, array $overrides = []): array
    {
        return [
            'created_by' => $admin->id,
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Cold Brew Starter Pack',
            'description' => 'A campaign for testing.',
            'category' => 'Food & Drink',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/campaign',
            'status' => 'active',
            'expires_at' => null,
            ...$overrides,
        ];
    }

    private function campaignRequestData(Brand $brand, array $overrides = []): array
    {
        return [
            'brand_id' => $brand->id,
            'title' => 'Cold Brew Starter Pack',
            'description' => 'A campaign for testing.',
            'category' => 'Food & Drink',
            'reward_amount' => '12.00',
            'destination_url' => 'https://example.com/campaign',
            'status' => 'active',
            'expires_at' => null,
            ...$overrides,
        ];
    }
}
