import { Link } from '@inertiajs/react';
import { formatReward } from '../Support/rewards';

function firstLetter(value = '') {
    return value.trim().slice(0, 1).toUpperCase() || 'S';
}

function PlaceholderArtwork({ campaign }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#22d3ee_0%,#1e293b_100%)]">
            <span className="text-7xl font-bold text-white/30">
                {firstLetter(campaign.brand_name || campaign.title)}
            </span>
        </div>
    );
}

export default function CampaignCard({ campaign }) {
    const detailHref = `/campaigns/${campaign.slug ?? campaign.id}`;
    const category = campaign.category ?? 'Featured';
    const tag = campaign.brand_industry ?? campaign.category ?? 'Campaign';
    const letter = firstLetter(campaign.brand_name || campaign.title);

    return (
        <Link
            href={detailHref}
            className="group relative block h-64 overflow-hidden rounded-xl bg-slate-200 shadow-sm transition duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-950/15 focus:outline-none focus:ring-2 focus:ring-[#08c4c4]/35"
        >
            {campaign.campaign_banner_url ? (
                <img
                    src={campaign.campaign_banner_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                />
            ) : (
                <PlaceholderArtwork campaign={campaign} />
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
            </div>
        </Link>
    );
}
