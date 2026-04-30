<?php

namespace Database\Seeders;

use App\Models\Brand;
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
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DemoUserSeeder extends Seeder
{
    /**
     * Seed demo participant users with campaign activity for the client dashboard.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $emails = [
                'user1@shareplattr.test',
                'user2@shareplattr.test',
                'user3@shareplattr.test',
            ];

            User::query()
                ->whereIn('email', $emails)
                ->get()
                ->each
                ->delete();

            $campaigns = $this->campaignsForDemo();

            foreach ($emails as $index => $email) {
                $user = $this->createDemoUser($index + 1, $email);
                $userCampaigns = $campaigns
                    ->shuffle()
                    ->take($index === 1 ? 2 : 3)
                    ->values();

                foreach ($userCampaigns as $campaignIndex => $campaign) {
                    $this->seedReferralActivity($user, $campaign, $index, $campaignIndex);
                }
            }

            $this->refreshCampaignTotals();
        });
    }

    private function createDemoUser(int $number, string $email): User
    {
        $attributes = [
            'name' => "Demo User {$number}",
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'is_admin' => false,
            'user_type' => 'participant',
        ];

        if (Schema::hasColumn('users', 'role')) {
            $attributes['role'] = 'participant';
        }

        return User::query()->forceCreate($attributes);
    }

    private function campaignsForDemo()
    {
        $campaigns = Campaign::query()
            ->available()
            ->inRandomOrder()
            ->limit(6)
            ->get();

        if ($campaigns->count() >= 3) {
            return $campaigns;
        }

        $fallbackCampaigns = [
            [
                'brand_name' => 'Northstar Coffee',
                'title' => 'Cold Brew Starter Pack',
                'description' => 'Share a fresh cold brew kit with filters, a reusable bottle, and beans for home brewers.',
                'category' => 'Food & Drink',
                'reward_amount' => 1200,
                'destination_url' => 'https://example.com/northstar-cold-brew',
            ],
            [
                'brand_name' => 'BrightDesk',
                'title' => 'Remote Work Setup Deal',
                'description' => 'Promote an ergonomic desk bundle built for creators, freelancers, and small teams.',
                'category' => 'Productivity',
                'reward_amount' => 2500,
                'destination_url' => 'https://example.com/brightdesk-setup',
            ],
            [
                'brand_name' => 'TrailKit',
                'title' => 'Weekend Hiking Essentials',
                'description' => 'Refer customers to a curated hiking kit with a day pack, trail bottle, and field guide.',
                'category' => 'Outdoors',
                'reward_amount' => 1800,
                'destination_url' => 'https://example.com/trailkit-weekend',
            ],
        ];

        foreach ($fallbackCampaigns as $data) {
            $brand = Brand::query()->firstOrCreate(
                ['name' => $data['brand_name']],
                [
                    'description' => $data['description'],
                    'business_type' => $data['category'],
                    'website_url' => $data['destination_url'],
                    'status' => 'active',
                ],
            );

            Campaign::query()->updateOrCreate(
                ['title' => $data['title']],
                [
                    ...$data,
                    'brand_id' => $brand->id,
                    'status' => 'active',
                    'expires_at' => now()->addMonths(6),
                ],
            );
        }

        return Campaign::query()
            ->available()
            ->inRandomOrder()
            ->limit(6)
            ->get();
    }

    private function seedReferralActivity(User $user, Campaign $campaign, int $userIndex, int $campaignIndex): void
    {
        $referralToken = ReferralToken::query()->forceCreate([
            'user_id' => $user->id,
            'campaign_id' => $campaign->id,
            'token' => $this->uniqueReferralToken(),
            'created_at' => now()->subDays(18 - ($userIndex * 3) - $campaignIndex),
            'updated_at' => now()->subDays(18 - ($userIndex * 3) - $campaignIndex),
        ]);

        $clickCount = random_int(35, 180);
        $conversionCount = min(random_int(3, 18), $clickCount);
        $duplicateClicks = max(1, (int) floor($clickCount * random_int(8, 18) / 100));

        for ($clickIndex = 0; $clickIndex < $clickCount; $clickIndex++) {
            $isDuplicate = $clickIndex < $duplicateClicks;
            $createdAt = Carbon::now()
                ->subDays(random_int(0, 28))
                ->subMinutes(random_int(0, 1440));

            Click::query()->forceCreate([
                'referral_token_id' => $referralToken->id,
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'ip_address' => $isDuplicate
                    ? "203.0.113.{$campaignIndex}"
                    : "198.51.100.".random_int(1, 254),
                'user_agent' => $this->randomUserAgent(),
                'is_flagged' => $isDuplicate,
                'flag_reason' => $isDuplicate ? 'duplicate' : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        for ($conversionIndex = 0; $conversionIndex < $conversionCount; $conversionIndex++) {
            $createdAt = Carbon::now()
                ->subDays(random_int(0, 24))
                ->subMinutes(random_int(0, 1440));

            $conversion = Conversion::query()->forceCreate([
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'referral_token_id' => $referralToken->id,
                'amount' => $campaign->reward_amount,
                'status' => 'verified',
                'notes' => 'Demo verified referral conversion.',
                'verified_at' => $createdAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            Reward::query()->forceCreate([
                'conversion_id' => $conversion->id,
                'user_id' => $user->id,
                'campaign_id' => $campaign->id,
                'amount' => $campaign->reward_amount,
                'status' => $conversionIndex % 4 === 0 ? 'paid' : 'pending',
                'paid_at' => $conversionIndex % 4 === 0 ? $createdAt->copy()->addDays(3) : null,
                'payout_reference' => $conversionIndex % 4 === 0 ? 'DEMO-'.Str::upper(Str::random(8)) : null,
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

    private function randomUserAgent(): string
    {
        return collect([
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 Chrome/125.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
            'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/125.0 Mobile Safari/537.36',
        ])->random();
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
