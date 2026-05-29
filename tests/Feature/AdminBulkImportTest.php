<?php

namespace Tests\Feature;

use App\Imports\BrandCampaignImport;
use App\Models\Brand;
use App\Models\Campaign;
use App\Models\ImportBatch;
use App\Models\ImportBatchRow;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;
use ZipArchive;

class AdminBulkImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_download_import_template(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->get(route('admin.imports.template'))
            ->assertOk()
            ->assertDownload('shareplattr-brand-campaign-template.xlsx');
    }

    public function test_import_template_includes_campaign_banner_filename_column(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.imports.template'))
            ->assertOk();

        $path = tempnam(sys_get_temp_dir(), 'shareplattr-template-');
        file_put_contents($path, $response->streamedContent());

        $sheet = IOFactory::load($path)->getSheetByName('Template');

        $this->assertContains('campaign_banner_filename', $sheet->rangeToArray('A1:M1')[0]);
        $this->assertContains('images/sample-campaign-banner.jpg', $sheet->rangeToArray('A2:M2')[0]);

        @unlink($path);
    }

    public function test_admin_can_import_brands_and_campaigns(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->csvUpload([
                    ['1', 'Booking Test', 'booking.test', 'https://booking.test/affiliates', 'https://booking.test/favicon.ico', 'Global', 'Travel - Hotels', 'Up to 4% per booking', '30 days', 'Direct', 'affiliates@booking.test', 'Requires approval.'],
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'))
            ->assertSessionHas('import_summary');

        $this->assertDatabaseHas('brands', [
            'name' => 'Booking Test',
            'normalized_name' => 'booking test',
            'domain' => 'booking.test',
            'affiliate_url' => 'https://booking.test/affiliates',
            'business_type' => 'Travel - Hotels',
        ]);

        $this->assertDatabaseHas('campaigns', [
            'brand_name' => 'Booking Test',
            'title' => 'Booking Test Affiliate Program',
            'normalized_title' => 'booking test affiliate program',
            'destination_url' => 'https://booking.test/affiliates',
            'category' => 'Travel - Hotels',
            'category_key' => 'other',
            'category_other' => 'Travel - Hotels',
            'commission_details' => 'Up to 4% per booking',
        ]);

        $this->assertDatabaseHas('import_batch_rows', [
            'row_number' => 2,
            'status' => 'created',
        ]);
    }

    public function test_zip_import_stores_matching_campaign_banner(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->zipUpload([
                    ['1', 'Nike', 'nike.example', 'https://nike.example/affiliates', '', 'Global', 'Retail', '$10 CPA', '30 days', 'Direct', '', 'Nike row.', 'images/nike-summer.png'],
                ], [
                    'images/nike-summer.png' => $this->pngImage(),
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'))
            ->assertSessionHas('import_summary.banners_matched', 1)
            ->assertSessionHas('import_summary.banners_stored', 1);

        $campaign = Campaign::query()->where('brand_name', 'Nike')->firstOrFail();

        $this->assertStringStartsWith('campaign-banners/', $campaign->campaign_banner);
        Storage::disk('public')->assertExists($campaign->campaign_banner);
    }

    public function test_zip_import_replaces_existing_campaign_banner(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $brand = Brand::create(['name' => 'Existing Brand']);
        $oldBannerPath = 'campaign-banners/old-banner.png';
        Storage::disk('public')->put($oldBannerPath, 'old banner');

        Campaign::create([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Existing Brand Affiliate Program',
            'description' => 'Old notes',
            'category' => 'Old',
            'reward_amount' => 100,
            'destination_url' => 'https://old.example.com',
            'campaign_banner' => $oldBannerPath,
            'status' => 'active',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->zipUpload([
                    ['1', 'Existing Brand', 'existing.example', 'https://existing.example/affiliates', '', 'USA', 'Finance', '$25 CPA', '30 days', 'Impact', '', 'Updated notes.', 'images/new-banner.png'],
                ], [
                    'images/new-banner.png' => $this->pngImage(),
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'));

        $newBannerPath = Campaign::query()->where('brand_id', $brand->id)->firstOrFail()->campaign_banner;

        $this->assertNotSame($oldBannerPath, $newBannerPath);
        Storage::disk('public')->assertExists($newBannerPath);
        Storage::disk('public')->assertMissing($oldBannerPath);
    }

    public function test_zip_import_keeps_existing_banner_when_no_banner_filename_is_provided(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $brand = Brand::create(['name' => 'Existing Brand']);
        $oldBannerPath = 'campaign-banners/old-banner.png';
        Storage::disk('public')->put($oldBannerPath, 'old banner');

        Campaign::create([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Existing Brand Affiliate Program',
            'description' => 'Old notes',
            'category' => 'Old',
            'reward_amount' => 100,
            'destination_url' => 'https://old.example.com',
            'campaign_banner' => $oldBannerPath,
            'status' => 'active',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->zipUpload([
                    ['1', 'Existing Brand', 'existing.example', 'https://existing.example/affiliates', '', 'USA', 'Finance', '$25 CPA', '30 days', 'Impact', '', 'Updated notes.', ''],
                ], [
                    'images/new-banner.png' => $this->pngImage(),
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'))
            ->assertSessionHas('import_summary.banners_stored', 0);

        $this->assertSame($oldBannerPath, Campaign::query()->where('brand_id', $brand->id)->firstOrFail()->campaign_banner);
        Storage::disk('public')->assertExists($oldBannerPath);
    }

    public function test_zip_import_keeps_existing_banner_and_warns_when_referenced_image_is_missing(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $brand = Brand::create(['name' => 'Existing Brand']);
        $oldBannerPath = 'campaign-banners/old-banner.png';
        Storage::disk('public')->put($oldBannerPath, 'old banner');

        Campaign::create([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Existing Brand Affiliate Program',
            'description' => 'Old notes',
            'category' => 'Old',
            'reward_amount' => 100,
            'destination_url' => 'https://old.example.com',
            'campaign_banner' => $oldBannerPath,
            'status' => 'active',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->zipUpload([
                    ['1', 'Existing Brand', 'existing.example', 'https://existing.example/affiliates', '', 'USA', 'Finance', '$25 CPA', '30 days', 'Impact', '', 'Updated notes.', 'images/missing.png'],
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'))
            ->assertSessionHas('import_summary.missing_banner_images', 1)
            ->assertSessionHas('import_summary.banner_warnings.0.row', 2);

        $this->assertSame($oldBannerPath, Campaign::query()->where('brand_id', $brand->id)->firstOrFail()->campaign_banner);
        Storage::disk('public')->assertExists($oldBannerPath);
    }

    public function test_zip_import_warns_and_continues_for_invalid_banner_image(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->zipUpload([
                    ['1', 'Invalid Banner Brand', 'invalid.example', 'https://invalid.example/affiliates', '', 'Global', 'Retail', '$10 CPA', '30 days', 'Direct', '', 'Invalid banner row.', 'images/banner.php'],
                ], [
                    'images/banner.php' => '<?php echo "bad";',
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'))
            ->assertSessionHas('import_summary.invalid_banner_images', 1);

        $campaign = Campaign::query()->where('brand_name', 'Invalid Banner Brand')->firstOrFail();

        $this->assertNull($campaign->campaign_banner);
    }

    public function test_zip_import_rejects_path_traversal_banner_reference_safely(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->zipUpload([
                    ['1', 'Traversal Brand', 'traversal.example', 'https://traversal.example/affiliates', '', 'Global', 'Retail', '$10 CPA', '30 days', 'Direct', '', 'Traversal row.', 'images/../evil.png'],
                ], [
                    'images/evil.png' => $this->pngImage(),
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'))
            ->assertSessionHas('import_summary.invalid_banner_images', 1);

        $campaign = Campaign::query()->where('brand_name', 'Traversal Brand')->firstOrFail();

        $this->assertNull($campaign->campaign_banner);
    }

    public function test_import_updates_duplicates_instead_of_creating_new_rows(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create(['name' => 'Existing Brand']);
        Campaign::create([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Existing Brand Affiliate Program',
            'description' => 'Old notes',
            'category' => 'Old',
            'reward_amount' => 100,
            'destination_url' => 'https://old.example.com',
            'status' => 'active',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->csvUpload([
                    ['1', 'Existing Brand', 'existing.example', 'https://existing.example/affiliates', '', 'USA', 'Finance', '$25 CPA', '30 days', 'Impact', 'team@example.com', 'Updated notes.'],
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'));

        $this->assertSame(1, Brand::count());
        $this->assertSame(1, Campaign::count());
        $this->assertDatabaseHas('campaigns', [
            'title' => 'Existing Brand Affiliate Program',
            'reward_amount' => 2500,
            'network_platform' => 'Impact',
        ]);
    }

    public function test_import_matches_duplicates_by_normalized_brand_and_campaign_title(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create(['name' => 'Existing Brand']);
        Campaign::create([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Existing Brand Affiliate Program',
            'description' => 'Old notes',
            'category' => 'Old',
            'reward_amount' => 100,
            'destination_url' => 'https://old.example.com',
            'status' => 'active',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->csvUpload([
                    ['1', ' existing   brand ', 'existing.example', 'https://existing.example/affiliates', '', 'USA', 'Finance', '$25 CPA', '30 days', 'Impact', 'team@example.com', 'Updated notes.'],
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'));

        $this->assertSame(1, Brand::count());
        $this->assertSame(1, Campaign::count());
        $this->assertDatabaseHas('brands', [
            'id' => $brand->id,
            'normalized_name' => 'existing brand',
        ]);
        $this->assertDatabaseHas('campaigns', [
            'brand_id' => $brand->id,
            'normalized_title' => 'existing brand affiliate program',
            'destination_url' => 'https://existing.example/affiliates',
        ]);
    }

    public function test_exact_same_file_warns_before_reimporting(): void
    {
        $admin = User::factory()->admin()->create();
        $row = ['1', 'Repeat Brand', 'repeat.example', 'https://repeat.example/affiliates', '', 'Global', 'SaaS', '$10 CPA', '30 days', 'Direct', '', 'Repeat row.'];

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->csvUpload([$row]),
            ])
            ->assertRedirect(route('admin.imports.index'));

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->csvUpload([$row]),
            ])
            ->assertRedirect(route('admin.imports.index'))
            ->assertSessionHas('duplicate_import');

        $this->assertSame(1, ImportBatch::count());
        $this->assertSame(1, Brand::count());
        $this->assertSame(1, Campaign::count());
    }

    public function test_exact_same_file_can_continue_and_skip_unchanged_rows(): void
    {
        $admin = User::factory()->admin()->create();
        $row = ['1', 'Skip Brand', 'skip.example', 'https://skip.example/affiliates', '', 'Global', 'SaaS', '$10 CPA', '30 days', 'Direct', '', 'Skip row.'];

        $this->actingAs($admin)->post(route('admin.imports.store'), [
            'file' => $this->csvUpload([$row]),
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->csvUpload([$row]),
                'continue_duplicate' => true,
            ])
            ->assertRedirect(route('admin.imports.index'))
            ->assertSessionHas('import_summary.skipped', 1);

        $this->assertSame(2, ImportBatch::count());
        $this->assertSame(1, Brand::count());
        $this->assertSame(1, Campaign::count());
        $this->assertDatabaseHas('import_batch_rows', [
            'status' => 'skipped',
        ]);
    }

    public function test_import_continues_when_rows_fail_validation(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->post(route('admin.imports.store'), [
                'file' => $this->csvUpload([
                    ['1', 'Good Brand', 'good.example', 'https://good.example/affiliates', '', 'Global', 'SaaS', '$10 CPA', '30 days', 'Direct', '', 'Good row.'],
                    ['2', '', 'bad.example', 'not-a-url', '', 'Global', 'SaaS', '$10 CPA', '30 days', 'Direct', '', 'Bad row.'],
                ]),
            ])
            ->assertRedirect(route('admin.imports.index'))
            ->assertSessionHas('import_summary.failed_rows.0.row', 3);

        $this->assertDatabaseHas('brands', ['name' => 'Good Brand']);
        $this->assertDatabaseMissing('brands', ['domain' => 'bad.example']);
    }

    public function test_admin_can_download_exports(): void
    {
        $admin = User::factory()->admin()->create();
        $brand = Brand::create(['name' => 'Export Brand']);
        Campaign::create([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => 'Export Brand Affiliate Program',
            'description' => 'Exportable',
            'category' => 'Retail',
            'reward_amount' => 100,
            'destination_url' => 'https://export.example.com',
            'status' => 'active',
        ]);

        $this->actingAs($admin)->get(route('admin.imports.export.brands'))->assertOk()->assertDownload('shareplattr-brands.xlsx');
        $this->actingAs($admin)->get(route('admin.imports.export.campaigns'))->assertOk()->assertDownload('shareplattr-campaigns.xlsx');
        $this->actingAs($admin)->get(route('admin.imports.export.all'))->assertOk()->assertDownload('shareplattr-brands-campaigns.xlsx');
    }

    private function csvUpload(array $rows): UploadedFile
    {
        $header = [
            '#',
            'Business Brand',
            'Domain',
            'Affiliate / Promo Page URL',
            'Logo / Favicon URL',
            'Country / Region',
            'Industry',
            'Commission',
            'Cookie Duration',
            'Network / Platform',
            'Contact Email / Phone',
            'Notes',
        ];

        $csvRows = collect([$header, ...$rows])
            ->map(fn (array $row) => collect($row)->map(fn ($value) => '"'.str_replace('"', '""', $value).'"')->implode(','))
            ->implode("\n");

        return UploadedFile::fake()->createWithContent('brand-campaigns.csv', $csvRows);
    }

    private function zipUpload(array $rows, array $images = []): UploadedFile
    {
        $zipPath = tempnam(sys_get_temp_dir(), 'shareplattr-import-');
        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::OVERWRITE);
        $zip->addFromString('campaigns.csv', $this->csvContent($rows, BrandCampaignImport::COLUMNS));

        foreach ($images as $path => $content) {
            $zip->addFromString($path, $content);
        }

        $zip->close();

        $upload = UploadedFile::fake()->createWithContent('affiliate-import.zip', file_get_contents($zipPath));
        @unlink($zipPath);

        return $upload;
    }

    private function csvContent(array $rows, array $header): string
    {
        return collect([$header, ...$rows])
            ->map(fn (array $row) => collect($row)->map(fn ($value) => '"'.str_replace('"', '""', $value).'"')->implode(','))
            ->implode("\n");
    }

    private function pngImage(): string
    {
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=');
    }
}
