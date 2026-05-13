<?php

namespace App\Support;

class Taxonomy
{
    public const OTHER = 'other';

    public const INDUSTRIES = [
        'retail' => 'Retail',
        'ecommerce' => 'E-commerce',
        'saas' => 'SaaS',
        'health_wellness' => 'Health & Wellness',
        'food_beverage' => 'Food & Beverage',
        'travel' => 'Travel',
        'finance' => 'Finance',
        'education' => 'Education',
        'real_estate' => 'Real Estate',
        'fashion' => 'Fashion',
        'beauty' => 'Beauty',
        'technology' => 'Technology',
        'gaming' => 'Gaming',
        'fitness' => 'Fitness',
        'automotive' => 'Automotive',
        'hospitality' => 'Hospitality',
        'nonprofit' => 'Nonprofit',
        'agency' => 'Agency',
        'media' => 'Media',
        self::OTHER => 'Other',
    ];

    public const CAMPAIGN_CATEGORIES = [
        'product_launch' => 'Product Launch',
        'seasonal_sale' => 'Seasonal Sale',
        'brand_awareness' => 'Brand Awareness',
        'customer_referral' => 'Customer Referral',
        'event_promotion' => 'Event Promotion',
        'giveaway' => 'Giveaway',
        'affiliate_push' => 'Affiliate Push',
        'influencer_campaign' => 'Influencer Campaign',
        'content_promotion' => 'Content Promotion',
        'lead_generation' => 'Lead Generation',
        'app_download' => 'App Download',
        'store_opening' => 'Store Opening',
        'community_growth' => 'Community Growth',
        'early_access' => 'Early Access',
        'limited_offer' => 'Limited Offer',
        self::OTHER => 'Other',
    ];

    public static function industryLabel(?string $key, ?string $other = null): ?string
    {
        return self::label(self::INDUSTRIES, $key, $other);
    }

    public static function campaignCategoryLabel(?string $key, ?string $other = null): ?string
    {
        return self::label(self::CAMPAIGN_CATEGORIES, $key, $other);
    }

    public static function industryFromValue(?string $value): array
    {
        return self::matchValue($value, self::INDUSTRIES, [
            'ecommerce' => ['ecommerce', 'e commerce', 'ecom', 'online shop', 'online store', 'web shop'],
            'saas' => ['saas', 'software', 'software as a service', 'productivity'],
            'health_wellness' => ['health', 'wellness', 'health wellness', 'health and wellness'],
            'food_beverage' => ['food', 'food drink', 'food and drink', 'food beverage', 'food and beverage', 'restaurant', 'cafe', 'coffee'],
            'real_estate' => ['real estate', 'property', 'properties', 'realty'],
            'technology' => ['tech', 'technology'],
            'nonprofit' => ['non profit', 'nonprofit', 'charity'],
        ]);
    }

    public static function campaignCategoryFromValue(?string $value): array
    {
        return self::matchValue($value, self::CAMPAIGN_CATEGORIES, [
            'product_launch' => ['launch', 'product launch'],
            'brand_awareness' => ['promo', 'promotion', 'awareness', 'brand awareness'],
            'customer_referral' => ['referral', 'referral drive', 'customer referral'],
            'event_promotion' => ['event', 'event promotion'],
            'influencer_campaign' => ['influencer', 'influencer campaign'],
            'affiliate_push' => ['affiliate', 'affiliate push'],
            'seasonal_sale' => ['sale', 'seasonal sale', 'holiday sale'],
            'app_download' => ['app', 'app download'],
            'lead_generation' => ['lead', 'lead generation'],
        ]);
    }

    public static function options(array $source): array
    {
        return collect($source)
            ->map(fn (string $label, string $key) => ['key' => $key, 'label' => $label])
            ->values()
            ->all();
    }

    private static function label(array $source, ?string $key, ?string $other = null): ?string
    {
        if ($key === self::OTHER) {
            return filled($other) ? $other : $source[self::OTHER];
        }

        return $source[$key] ?? null;
    }

    private static function matchValue(?string $value, array $source, array $aliases): array
    {
        $original = trim((string) $value);

        if ($original === '') {
            return [null, null, false];
        }

        $normalized = self::normalize($original);

        foreach ($source as $key => $label) {
            if ($key === self::OTHER) {
                continue;
            }

            if ($normalized === self::normalize($label) || $normalized === self::normalize($key)) {
                return [$key, null, false];
            }
        }

        foreach ($aliases as $key => $values) {
            if (in_array($normalized, array_map(fn (string $item) => self::normalize($item), $values), true)) {
                return [$key, null, false];
            }
        }

        return [self::OTHER, $original, true];
    }

    private static function normalize(string $value): string
    {
        return preg_replace('/\s+/', ' ', trim(strtolower(str_replace(['&', '-', '_', '/'], ' ', $value)))) ?? '';
    }
}
