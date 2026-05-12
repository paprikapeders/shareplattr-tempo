export function formatReward(campaign) {
    if ((campaign?.reward_type ?? 'flat') === 'percentage') {
        const percentage = (campaign.reward_amount ?? 0) / 100;

        return `${Number.isInteger(percentage) ? percentage.toFixed(0) : percentage.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}%`;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format((campaign?.reward_amount ?? 0) / 100);
}
