import { Link } from '@inertiajs/react';
import Button from './Button';

function formatReward(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

function BrandBadge({ campaign }) {
    if (campaign.brand_logo_url) {
        return (
            <img
                src={campaign.brand_logo_url}
                alt=""
                className="h-9 w-9 rounded-full border border-white/40 object-cover shadow-sm shadow-black/10"
            />
        );
    }

    return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/90 text-xs font-bold uppercase text-slate-700 shadow-sm shadow-black/10">
            {campaign.brand_name?.slice(0, 1) ?? 'S'}
        </div>
    );
}

function PlaceholderArtwork() {
    return (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_transparent_34%),linear-gradient(140deg,_#1d4ed8_0%,_#38bdf8_36%,_#0f172a_100%)]" />
    );
}

export default function CampaignCard({
    campaign,
    copiedUrl,
    generating,
    onGenerateLink,
    onCopyLink,
}) {
    return (
        <article className="group h-full overflow-hidden rounded-[26px] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.14)]">
            <div className="relative flex h-full min-h-[390px] flex-col overflow-hidden">
                {campaign.campaign_banner_url ? (
                    <img
                        src={campaign.campaign_banner_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                ) : (
                    <PlaceholderArtwork />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />

                <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/16 px-3 py-2 backdrop-blur-md">
                            <BrandBadge campaign={campaign} />
                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-medium text-white/80">{campaign.brand_name}</p>
                                <p className="truncate text-xs font-semibold text-white">{campaign.category ?? 'Featured campaign'}</p>
                            </div>
                        </div>
                        <div className="rounded-full bg-white/14 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                            Featured
                        </div>
                    </div>

                    <div className="mt-8 flex flex-1 flex-col justify-end space-y-4">
                        <div className="min-h-[120px]">
                            <p className="text-[2rem] font-bold leading-none tracking-tight text-white">
                                {formatReward(campaign.reward_amount)}
                            </p>
                            <h2 className="mt-3 line-clamp-2 text-xl font-semibold leading-6 text-white">
                                {campaign.title}
                            </h2>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/84">
                                {campaign.description}
                            </p>
                            <Link
                                href={`/campaigns/${campaign.slug ?? campaign.id}`}
                                className="mt-3 inline-flex text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 transition hover:decoration-white"
                            >
                                See details
                            </Link>
                        </div>

                        {campaign.referral_url ? (
                            <div className="rounded-2xl bg-white/92 p-3 shadow-sm backdrop-blur">
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    YOUR REFERRAL LINK
                                </p>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left font-mono text-xs leading-5 text-slate-800 shadow-sm">
                                        <span className="block truncate">{campaign.referral_url}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant={copiedUrl === campaign.referral_url ? 'subtle' : 'primary'}
                                        onClick={() => onCopyLink(campaign.referral_url)}
                                        className="rounded-xl sm:min-w-[110px]"
                                    >
                                        {copiedUrl === campaign.referral_url ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-white/14 p-3 backdrop-blur">
                                    <Button
                                        type="button"
                                        onClick={() => onGenerateLink(campaign.slug ?? campaign.id)}
                                        disabled={generating}
                                    className="w-full rounded-xl border-white/0 bg-white text-slate-950 hover:bg-slate-100"
                                >
                                    {generating ? 'Generating...' : 'Generate Link'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
