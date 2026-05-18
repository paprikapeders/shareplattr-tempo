import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { formatExpiryDate } from '../Support/dates';
import { formatReward } from '../Support/rewards';

function firstLetter(value = '') {
    return value.trim().slice(0, 1).toUpperCase() || 'S';
}

function brandName(campaign) {
    return campaign.brand?.name || campaign.brand_name || campaign.title || 'SharePlattr';
}

function brandInitials(campaign) {
    const name = brandName(campaign).trim();
    const words = name.split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase() || 'SP';
}

function CampaignImageFallback({ campaign }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#dff7f8_45%,#dbeafe_100%)]">
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-cyan-200/60 blur-2xl" />
            <div className="absolute -bottom-14 right-0 h-36 w-36 rounded-full bg-indigo-200/60 blur-2xl" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 text-3xl font-black text-slate-800 shadow-sm ring-1 ring-white/70">
                {brandInitials(campaign)}
            </span>
            <span className="absolute bottom-3 right-3 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                SharePlattr
            </span>
        </div>
    );
}

export default function CampaignCard({ campaign }) {
    const [imageFailed, setImageFailed] = useState(false);
    const detailHref = `/campaigns/${campaign.slug ?? campaign.id}`;
    const category = campaign.category ?? 'Featured';
    const tag = campaign.brand_industry ?? campaign.category ?? 'Campaign';
    const letter = firstLetter(brandName(campaign));
    const showImage = campaign.campaign_banner_url && !imageFailed;

    return (
        <Link
            href={detailHref}
            className="group relative block h-64 overflow-hidden rounded-xl bg-slate-200 shadow-sm transition duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-950/15 focus:outline-none focus:ring-2 focus:ring-[#08c4c4]/35"
        >
            {showImage ? (
                <img
                    src={campaign.campaign_banner_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                />
            ) : (
                <CampaignImageFallback campaign={campaign} />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                {letter}
            </div>

            <div className="absolute right-3 top-3 rounded bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-800 backdrop-blur">
                {tag}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <span className="inline-flex rounded bg-white/18 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
                    {category}
                </span>
                <h2 className="mt-2 line-clamp-1 text-sm font-bold leading-tight">
                    {campaign.title}
                </h2>
                <p className="mt-1 text-lg font-extrabold leading-none">
                    {formatReward(campaign)}
                </p>
                <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-white/90">
                    {campaign.description}
                </p>
                {campaign.expires_at && (
                    <p className="mt-2 text-[11px] font-bold text-white/85">
                        {formatExpiryDate(campaign.expires_at)}
                    </p>
                )}
            </div>
        </Link>
    );
}
