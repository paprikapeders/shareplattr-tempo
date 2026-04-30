<?php

namespace Tests\Feature;

use App\Models\Campaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampaignSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_unique_slug_falls_back_when_title_is_null(): void
    {
        $this->assertSame('campaign', Campaign::uniqueSlug(null));
    }

    public function test_unique_slug_keeps_fallback_unique(): void
    {
        Campaign::create([
            'brand_name' => 'Northstar Coffee',
            'title' => 'Campaign',
            'description' => 'A campaign using the fallback slug.',
            'category' => 'Food & Drink',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/northstar-cold-brew',
            'status' => 'active',
            'expires_at' => null,
        ]);

        $this->assertSame('campaign-2', Campaign::uniqueSlug(null));
    }
}
