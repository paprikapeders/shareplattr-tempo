<?php

namespace Tests\Unit;

use App\Support\Taxonomy;
use PHPUnit\Framework\TestCase;

class TaxonomyTest extends TestCase
{
    public function test_industry_values_map_to_stable_keys(): void
    {
        $this->assertSame(['ecommerce', null, false], Taxonomy::industryFromValue('e-commerce'));
        $this->assertSame(['ecommerce', null, false], Taxonomy::industryFromValue('online shop'));
        $this->assertSame(['saas', null, false], Taxonomy::industryFromValue('software'));
        $this->assertSame(['real_estate', null, false], Taxonomy::industryFromValue('property'));
    }

    public function test_unknown_values_are_preserved_for_review(): void
    {
        $this->assertSame(['other', 'Bespoke Ceramics', true], Taxonomy::industryFromValue('  Bespoke Ceramics  '));
        $this->assertSame(['other', 'Campus Ambassadors', true], Taxonomy::campaignCategoryFromValue('Campus Ambassadors'));
    }

    public function test_campaign_category_values_map_to_stable_keys(): void
    {
        $this->assertSame(['product_launch', null, false], Taxonomy::campaignCategoryFromValue('launch'));
        $this->assertSame(['brand_awareness', null, false], Taxonomy::campaignCategoryFromValue('promo'));
        $this->assertSame(['customer_referral', null, false], Taxonomy::campaignCategoryFromValue('referral drive'));
    }
}
