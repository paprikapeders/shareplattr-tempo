<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminBrandTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_brand_with_put_request(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create([
            'name' => 'Northstar Coffee',
            'business_type' => 'Food',
            'website_url' => 'https://northstar.example',
            'status' => 'active',
        ]);

        $this
            ->actingAs($admin)
            ->put(route('admin.brands.update', $brand), $this->brandRequestData([
                'name' => 'Northstar Coffee Roasters',
                'business_type' => 'Food & Drink',
                'status' => 'inactive',
            ]))
            ->assertRedirect(route('admin.brands.show', $brand))
            ->assertSessionHas('success', 'Brand updated.');

        $this->assertDatabaseHas('brands', [
            'id' => $brand->id,
            'name' => 'Northstar Coffee Roasters',
            'business_type' => 'Food & Drink',
            'website_url' => 'https://example.com',
            'status' => 'inactive',
        ]);
    }

    public function test_admin_can_update_brand_with_post_method_spoofing(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create([
            'name' => 'Summit Studio',
            'status' => 'active',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.brands.update', $brand), $this->brandRequestData([
                '_method' => 'put',
                'name' => 'Summit Studio Updated',
            ]))
            ->assertRedirect(route('admin.brands.show', $brand));

        $this->assertDatabaseHas('brands', [
            'id' => $brand->id,
            'name' => 'Summit Studio Updated',
        ]);
    }

    public function test_admin_can_replace_brand_logo_and_old_logo_is_deleted(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $oldLogoPath = 'brands/logos/old-logo.jpg';
        Storage::disk('public')->put($oldLogoPath, 'old logo');

        $brand = Brand::create([
            'name' => 'Logo Brand',
            'logo' => $oldLogoPath,
            'status' => 'active',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.brands.update', $brand), $this->brandRequestData([
                '_method' => 'put',
                'logo' => UploadedFile::fake()->createWithContent(
                    'updated-logo.png',
                    base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='),
                ),
            ]))
            ->assertRedirect(route('admin.brands.show', $brand));

        $newLogoPath = $brand->fresh()->logo;

        $this->assertNotSame($oldLogoPath, $newLogoPath);
        $this->assertStringStartsWith('brands/logos/', $newLogoPath);
        Storage::disk('public')->assertExists($newLogoPath);
        Storage::disk('public')->assertMissing($oldLogoPath);
    }

    public function test_brand_update_preserves_existing_logo_without_new_upload(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $oldLogoPath = 'brands/logos/old-logo.jpg';
        Storage::disk('public')->put($oldLogoPath, 'old logo');

        $brand = Brand::create([
            'name' => 'Preserved Logo',
            'logo' => $oldLogoPath,
            'status' => 'active',
        ]);

        $this
            ->actingAs($admin)
            ->put(route('admin.brands.update', $brand), $this->brandRequestData([
                'name' => 'Preserved Logo Updated',
            ]))
            ->assertRedirect(route('admin.brands.show', $brand));

        $this->assertSame($oldLogoPath, $brand->fresh()->logo);
        Storage::disk('public')->assertExists($oldLogoPath);
    }

    public function test_brand_search_returns_matching_brands_only(): void
    {
        $admin = User::factory()->admin()->create();

        Brand::create([
            'name' => 'Nike',
            'business_type' => 'Retail',
            'website_url' => 'https://nike.example',
            'status' => 'active',
        ]);
        Brand::create([
            'name' => 'Quiet Accounting',
            'business_type' => 'Finance',
            'website_url' => 'https://accounting.example',
            'status' => 'inactive',
        ]);

        $this
            ->actingAs($admin)
            ->get(route('admin.brands.index', ['search' => 'nike']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Brands/Index')
                ->where('filters.search', 'nike')
                ->has('brands', 1)
                ->where('brands.0.name', 'Nike')
            );
    }

    public function test_brand_search_can_match_business_type_website_and_status(): void
    {
        $admin = User::factory()->admin()->create();

        Brand::create([
            'name' => 'Summit Gear',
            'business_type' => 'Outdoor',
            'website_url' => 'https://summit.example',
            'status' => 'active',
        ]);
        Brand::create([
            'name' => 'Harbor Tools',
            'business_type' => 'Hardware',
            'website_url' => 'https://harbor.example',
            'status' => 'inactive',
        ]);

        $this
            ->actingAs($admin)
            ->get(route('admin.brands.index', ['search' => 'inactive']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('brands', 1)
                ->where('brands.0.name', 'Harbor Tools')
            );

        $this
            ->actingAs($admin)
            ->get(route('admin.brands.index', ['search' => 'summit.example']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('brands', 1)
                ->where('brands.0.name', 'Summit Gear')
            );
    }

    public function test_non_admin_users_cannot_update_brands(): void
    {
        $user = User::factory()->create();
        $brand = Brand::create([
            'name' => 'Locked Brand',
            'status' => 'active',
        ]);

        $this
            ->actingAs($user)
            ->put(route('admin.brands.update', $brand), $this->brandRequestData([
                'name' => 'Changed Brand',
            ]))
            ->assertForbidden();

        $this->assertDatabaseHas('brands', [
            'id' => $brand->id,
            'name' => 'Locked Brand',
        ]);
    }

    private function brandRequestData(array $overrides = []): array
    {
        return [
            'name' => 'Updated Brand',
            'description' => 'Updated description.',
            'business_type' => 'Retail',
            'country_region' => 'Global',
            'website_url' => 'https://example.com',
            'domain' => 'example.com',
            'affiliate_url' => 'https://example.com/affiliates',
            'logo_url' => 'https://example.com/logo.png',
            'contact_info' => 'partners@example.com',
            'notes' => 'Updated notes.',
            'status' => 'active',
            ...$overrides,
        ];
    }
}
