<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\BusinessProfile;
use App\Models\Campaign;
use App\Models\Click;
use App\Models\Conversion;
use App\Models\ReferralToken;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BusinessOwnerSeeder extends Seeder
{
    /**
     * Seed demo business-owner accounts, profiles, owned campaigns, and light stats.
     */
    public function run(): void
    {
        DB::transaction(function () {
            foreach ($this->owners() as $ownerIndex => $ownerData) {
                $owner = User::query()->updateOrCreate(
                    ['email' => $ownerData['email']],
                    [
                        'name' => $ownerData['contact_person_name'],
                        'email_verified_at' => now(),
                        'password' => Hash::make('business12345'),
                        'is_admin' => false,
                        'user_type' => 'business_owner',
                    ],
                );

                $brand = Brand::query()->updateOrCreate(
                    ['name' => $ownerData['company_name']],
                    [
                        'description' => $ownerData['description'],
                        'business_type' => $ownerData['industry'],
                        'website_url' => $ownerData['website_url'],
                        'status' => 'active',
                    ],
                );

                BusinessProfile::query()->updateOrCreate(
                    ['user_id' => $owner->id],
                    [
                        'brand_id' => $brand->id,
                        'company_name' => $ownerData['company_name'],
                        'contact_person_name' => $ownerData['contact_person_name'],
                        'website_url' => $ownerData['website_url'],
                        'phone' => $ownerData['phone'],
                        'industry' => $ownerData['industry'],
                        'industry_key' => $ownerData['industry_key'],
                        'industry_other' => $ownerData['industry_other'] ?? null,
                        'description' => $ownerData['description'],
                        'status' => 'active',
                    ],
                );

                foreach ($ownerData['campaigns'] as $campaignIndex => $campaignData) {
                    $campaign = Campaign::query()->updateOrCreate(
                        ['title' => $campaignData['title']],
                        [
                            'created_by' => $owner->id,
                            'business_owner_id' => $owner->id,
                            'brand_id' => $brand->id,
                            'brand_name' => $brand->name,
                            'description' => $campaignData['description'],
                            'category' => $campaignData['category'],
                            'category_key' => $campaignData['category_key'],
                            'category_other' => $campaignData['category_other'] ?? null,
                            'reward_amount' => $campaignData['reward_amount'],
                            'destination_url' => $campaignData['destination_url'],
                            'status' => $campaignData['status'],
                            'expires_at' => $campaignData['expires_at'],
                        ],
                    );

                    $this->seedCampaignActivity($campaign, $ownerIndex, $campaignIndex);
                }
            }

            $this->refreshCampaignTotals();
        });
    }

    private function owners(): array
    {
        return [
            [
                'email' => 'business1@shareplattr.test',
                'contact_person_name' => 'Maya Santos',
                'company_name' => 'Luma Pantry',
                'website_url' => 'https://example.com/luma-pantry',
                'phone' => '+1 555 0101',
                'industry' => 'Food & Drink',
                'industry_key' => 'food_beverage',
                'description' => 'Small-batch pantry goods and starter bundles for home kitchens.',
                'campaigns' => [
                    [
                        'title' => 'Luma Pantry Starter Box',
                        'description' => 'Refer new customers to a curated box of small-batch sauces, spices, and pantry staples.',
                        'category' => 'Product Launch',
                        'category_key' => 'product_launch',
                        'reward_amount' => 1400,
                        'destination_url' => 'https://example.com/luma-pantry/starter-box',
                        'status' => 'active',
                        'expires_at' => now()->addMonths(4),
                    ],
                    [
                        'title' => 'Luma Pantry Gift Set',
                        'description' => 'Promote a gift-ready pantry set for birthdays, housewarmings, and client gifts.',
                        'category' => 'Seasonal Sale',
                        'category_key' => 'seasonal_sale',
                        'reward_amount' => 1800,
                        'destination_url' => 'https://example.com/luma-pantry/gift-set',
                        'status' => 'draft',
                        'expires_at' => null,
                    ],
                ],
            ],
            [
                'email' => 'business2@shareplattr.test',
                'contact_person_name' => 'Jordan Lee',
                'company_name' => 'Orbit Desk Co',
                'website_url' => 'https://example.com/orbit-desk',
                'phone' => '+1 555 0102',
                'industry' => 'SaaS',
                'industry_key' => 'saas',
                'description' => 'Workspace accessories and compact desk upgrades for remote teams.',
                'campaigns' => [
                    [
                        'title' => 'Orbit Desk Cable Kit',
                        'description' => 'Share a cable-management kit built for clean desk setups and home offices.',
                        'category' => 'Affiliate Push',
                        'category_key' => 'affiliate_push',
                        'reward_amount' => 2200,
                        'destination_url' => 'https://example.com/orbit-desk/cable-kit',
                        'status' => 'active',
                        'expires_at' => now()->addMonths(6),
                    ],
                    [
                        'title' => 'Orbit Desk Focus Bundle',
                        'description' => 'Promote an ergonomic focus bundle with stand, tray, and desk organizer.',
                        'category' => 'Brand Awareness',
                        'category_key' => 'brand_awareness',
                        'reward_amount' => 3000,
                        'destination_url' => 'https://example.com/orbit-desk/focus-bundle',
                        'status' => 'paused',
                        'expires_at' => now()->addMonths(2),
                    ],
                ],
            ],
        ];
    }

    private function seedCampaignActivity(Campaign $campaign, int $ownerIndex, int $campaignIndex): void
    {
        if ($campaign->status !== 'active') {
            return;
        }

        $participant = User::query()->firstOrCreate(
            ['email' => "business-demo-referrer-{$ownerIndex}-{$campaignIndex}@shareplattr.test"],
            [
                'name' => 'Business Demo Referrer',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'user_type' => 'participant',
            ],
        );

        $token = ReferralToken::query()->firstOrCreate(
            [
                'user_id' => $participant->id,
                'campaign_id' => $campaign->id,
            ],
            [
                'token' => $this->uniqueReferralToken(),
            ],
        );

        $clicksToCreate = 18 + ($ownerIndex * 8) + ($campaignIndex * 4);
        $existingClicks = Click::query()->where('referral_token_id', $token->id)->count();

        for ($index = $existingClicks; $index < $clicksToCreate; $index++) {
            $createdAt = Carbon::now()->subDays(random_int(0, 21))->subMinutes(random_int(0, 1440));
            $isDuplicate = $index % 7 === 0;

            Click::query()->forceCreate([
                'referral_token_id' => $token->id,
                'campaign_id' => $campaign->id,
                'user_id' => $participant->id,
                'ip_address' => $isDuplicate ? '203.0.113.50' : '198.51.100.'.random_int(10, 240),
                'user_agent' => 'Mozilla/5.0 Demo Business Seeder',
                'is_flagged' => $isDuplicate,
                'flag_reason' => $isDuplicate ? 'duplicate' : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $conversionsToCreate = 3 + $ownerIndex + $campaignIndex;
        $existingConversions = Conversion::query()->where('referral_token_id', $token->id)->count();

        for ($index = $existingConversions; $index < $conversionsToCreate; $index++) {
            $createdAt = Carbon::now()->subDays(random_int(0, 18))->subMinutes(random_int(0, 1440));
            $conversion = Conversion::query()->forceCreate([
                'campaign_id' => $campaign->id,
                'user_id' => $participant->id,
                'referral_token_id' => $token->id,
                'amount' => $campaign->reward_amount,
                'status' => 'verified',
                'notes' => 'Demo business-owner campaign conversion.',
                'verified_at' => $createdAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            Reward::query()->forceCreate([
                'conversion_id' => $conversion->id,
                'user_id' => $participant->id,
                'campaign_id' => $campaign->id,
                'amount' => $campaign->reward_amount,
                'status' => $index % 3 === 0 ? 'paid' : 'pending',
                'paid_at' => $index % 3 === 0 ? $createdAt->copy()->addDays(2) : null,
                'payout_reference' => $index % 3 === 0 ? 'BUS-DEMO-'.Str::upper(Str::random(6)) : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }

    private function uniqueReferralToken(): string
    {
        do {
            $token = Str::upper(Str::random(8));
        } while (ReferralToken::query()->where('token', $token)->exists());

        return $token;
    }

    private function refreshCampaignTotals(): void
    {
        Campaign::query()
            ->select('id')
            ->each(function (Campaign $campaign) {
                $campaign->forceFill([
                    'click_count' => Click::query()->where('campaign_id', $campaign->id)->count(),
                    'conversion_count' => Conversion::query()->where('campaign_id', $campaign->id)->count(),
                ])->save();
            });
    }
}
