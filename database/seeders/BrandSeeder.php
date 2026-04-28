<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            [
                'name' => 'Northstar Coffee',
                'description' => 'Coffee products and starter packs for home brewers.',
                'business_type' => 'Food & Drink',
                'website_url' => 'https://example.com/northstar',
                'status' => 'active',
            ],
            [
                'name' => 'BrightDesk',
                'description' => 'Remote work furniture and ergonomic bundles.',
                'business_type' => 'Productivity',
                'website_url' => 'https://example.com/brightdesk',
                'status' => 'active',
            ],
            [
                'name' => 'TrailKit',
                'description' => 'Outdoor gear bundles for weekend adventures.',
                'business_type' => 'Outdoors',
                'website_url' => 'https://example.com/trailkit',
                'status' => 'active',
            ],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(
                ['name' => $brand['name']],
                $brand,
            );
        }
    }
}
