import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ImageWithFallback from './ImageWithFallback';
import { formatExpiryDate } from '../Support/dates';
import { formatReward } from '../Support/rewards';

function firstLetter(value = '') {
    return value.trim().slice(0, 1).toUpperCase() || 'S';
}

function brandName(campaign) {
    return campaign.brand?.name || campaign.brand_name || campaign.title || 'SharePlattr';
}

function rewardCallout(campaign) {
    if ((campaign.reward_type ?? 'flat') === 'percentage') {
        return `${formatReward(campaign)} commission`;
    }

    return `${formatReward(campaign)} / referral`;
}

function BrandLogoBadge({ campaign, letter }) {
    const [failed, setFailed] = useState(false);
    const logoUrl = campaign.brand_logo_url;
    const hasLogo = typeof logoUrl === 'string' && logoUrl.trim() !== '';

    useEffect(() => {
        setFailed(false);
    }, [logoUrl]);

    if (hasLogo && !failed) {
        return (
            <img
                src={logoUrl}
                alt=""
                className="h-6 w-6 shrink-0 rounded-full bg-white object-cover shadow-sm ring-1 ring-white/60"
                loading="lazy"
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/60">
            {letter}
        </div>
    );
}

export default function CampaignCard({ campaign }) {
    const detailHref = `/campaigns/${campaign.slug ?? campaign.id}`;
    const category = campaign.category ?? 'Featured';
    const letter = firstLetter(brandName(campaign));
    const reward = rewardCallout(campaign);
    const expiryLabel = campaign.expires_at ? formatExpiryDate(campaign.expires_at, null) : null;

    return (
        <Link
            href={detailHref}
            className="group relative block h-72 overflow-hidden rounded-xl bg-slate-200 shadow-sm transition duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-950/15 focus:outline-none focus:ring-2 focus:ring-[#08c4c4]/35"
        >
            <ImageWithFallback
                src={campaign.campaign_banner_url}
                alt=""
                fallbackLabel={brandName(campaign)}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                showFallbackContent={false}
                showFallbackDecorations={false}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/34 to-transparent" />

            <div className="absolute left-3 top-3 flex max-w-[calc(100%-7rem)] items-center gap-2">
                <BrandLogoBadge campaign={campaign} letter={letter} />
                {expiryLabel && (
                    <span className="truncate rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/15 backdrop-blur">
                        {expiryLabel}
                    </span>
                )}
            </div>

            <div className="absolute right-3 top-3 rounded bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-800 backdrop-blur">
                {category}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <h2 className="line-clamp-1 text-sm font-bold leading-tight">
                    {campaign.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-white/90">
                    {campaign.description}
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/92 px-3 py-2 text-left text-slate-950 shadow-sm backdrop-blur">
                    <span className="shrink-0 rounded bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-800">
                        Cash reward
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-black leading-none">{reward}</p>
                        <p className="mt-1 text-[11px] font-semibold leading-none text-slate-500">Verified referral</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
