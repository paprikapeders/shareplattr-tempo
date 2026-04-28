<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Campaign;
use Illuminate\Database\Seeder;

class CampaignSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $campaigns = [
            [
                'brand_name' => 'Northstar Coffee',
                'title' => 'Cold Brew Starter Pack',
                'description' => 'Share a limited starter pack for fresh cold brew, filters, and a reusable glass bottle.',
                'category' => 'Food & Drink',
                'reward_amount' => 1200,
                'destination_url' => 'https://example.com/northstar-cold-brew',
                'status' => 'active',
            ],
            [
                'brand_name' => 'BrightDesk',
                'title' => 'Remote Work Setup Deal',
                'description' => 'Promote an ergonomic desk bundle for creators, freelancers, and small teams.',
                'category' => 'Productivity',
                'reward_amount' => 2500,
                'destination_url' => 'https://example.com/brightdesk-setup',
                'status' => 'active',
            ],
            [
                'brand_name' => 'TrailKit',
                'title' => 'Weekend Hiking Essentials',
                'description' => 'Refer new customers to a curated hiking kit with a day pack, bottle, and trail guide.',
                'category' => 'Outdoors',
                'reward_amount' => 1800,
                'destination_url' => 'https://example.com/trailkit-weekend',
                'status' => 'active',
            ],
        ];

        foreach ($campaigns as $campaign) {
            $brand = Brand::query()->where('name', $campaign['brand_name'])->first();

            Campaign::updateOrCreate(
                ['title' => $campaign['title']],
                [
                    ...$campaign,
                    'brand_id' => $brand?->id,
                ],
            );
        }
    }
}
