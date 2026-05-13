export const OTHER_KEY = 'other';

export const INDUSTRY_OPTIONS = [
    { value: 'retail', label: 'Retail' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'saas', label: 'SaaS' },
    { value: 'health_wellness', label: 'Health & Wellness' },
    { value: 'food_beverage', label: 'Food & Beverage' },
    { value: 'travel', label: 'Travel' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'technology', label: 'Technology' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'nonprofit', label: 'Nonprofit' },
    { value: 'agency', label: 'Agency' },
    { value: 'media', label: 'Media' },
    { value: OTHER_KEY, label: 'Other' },
];

export const CAMPAIGN_CATEGORY_OPTIONS = [
    { value: 'product_launch', label: 'Product Launch' },
    { value: 'seasonal_sale', label: 'Seasonal Sale' },
    { value: 'brand_awareness', label: 'Brand Awareness' },
    { value: 'customer_referral', label: 'Customer Referral' },
    { value: 'event_promotion', label: 'Event Promotion' },
    { value: 'giveaway', label: 'Giveaway' },
    { value: 'affiliate_push', label: 'Affiliate Push' },
    { value: 'influencer_campaign', label: 'Influencer Campaign' },
    { value: 'content_promotion', label: 'Content Promotion' },
    { value: 'lead_generation', label: 'Lead Generation' },
    { value: 'app_download', label: 'App Download' },
    { value: 'store_opening', label: 'Store Opening' },
    { value: 'community_growth', label: 'Community Growth' },
    { value: 'early_access', label: 'Early Access' },
    { value: 'limited_offer', label: 'Limited Offer' },
    { value: OTHER_KEY, label: 'Other' },
];

export function optionLabel(options, value) {
    return options.find((option) => option.value === value)?.label ?? '';
}
