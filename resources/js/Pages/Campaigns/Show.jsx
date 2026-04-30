import { Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ClientLayout from '../../Layouts/ClientLayout';

const DEMO_FALLBACKS = {
    participants: 89,
    clicks: 5200,
    conversions: 201,
    daysLeft: 24,
    brandReach: '50k+',
    brandRating: '4.7',
};

function currency(cents = 0) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

function compactNumber(value) {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

function daysLeft(expiresAt) {
    if (!expiresAt) {
        return null;
    }

    const end = new Date(expiresAt);
    const diff = end.getTime() - Date.now();

    if (Number.isNaN(diff)) {
        return null;
    }

    return Math.max(0, Math.ceil(diff / 86400000));
}

function initials(name = '') {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'S';
}

function Toast({ message }) {
    if (!message) {
        return null;
    }

    return (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/20">
            {message}
        </div>
    );
}

function BrandAvatar({ campaign, className = '' }) {
    if (campaign.brand_logo_url) {
        return (
            <img
                src={campaign.brand_logo_url}
                alt=""
                className={`object-cover ${className}`}
            />
        );
    }

    return (
        <div className={`flex items-center justify-center bg-cyan-50 font-extrabold text-[#08bcbc] ${className}`}>
            {initials(campaign.brand_name || campaign.title)}
        </div>
    );
}

function Card({ children, className = '' }) {
    return (
        <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/5 ${className}`}>
            {children}
        </section>
    );
}

function Pill({ children, className = '' }) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm backdrop-blur ${className}`}>
            {children}
        </span>
    );
}

function Hero({ campaign, reward, remainingDays }) {
    return (
        <section className="relative min-h-[255px] overflow-hidden rounded-none bg-slate-900 sm:rounded-2xl">
            {campaign.campaign_banner_url ? (
                <img
                    src={campaign.campaign_banner_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#0e7490_48%,#7c3aed_100%)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/38 to-black/12" />

            <div className="relative flex min-h-[255px] flex-col justify-end gap-5 p-5 text-white sm:p-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex min-w-0 items-end gap-4">
                    <BrandAvatar campaign={campaign} className="h-14 w-14 shrink-0 rounded-2xl bg-white text-lg shadow-xl ring-1 ring-white/70 sm:h-16 sm:w-16" />
                    <div className="min-w-0 pb-1">
                        <div className="flex flex-wrap items-center gap-2">
                            {campaign.category && (
                                <span className="rounded-full bg-[#08bcbc]/90 px-3 py-1 text-xs font-bold text-white">
                                    {campaign.category}
                                </span>
                            )}
                            <span className="text-xs font-semibold text-white/85">by {campaign.brand_name ?? 'SharePlattr brand'}</span>
                        </div>
                        <h1 className="mt-2 line-clamp-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                            {campaign.title}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Pill className="bg-white/18 ring-1 ring-white/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active
                    </Pill>
                    <Pill className="bg-white/18 ring-1 ring-white/25">
                        <span aria-hidden="true">$</span>
                        {reward} / conversion
                    </Pill>
                    <Pill className="bg-white/18 ring-1 ring-white/25">
                        <span aria-hidden="true">h</span>
                        {remainingDays} days left
                    </Pill>
                </div>
            </div>
        </section>
    );
}

function StatCard({ label, value, helper }) {
    return (
        <Card className="p-5">
            <p className="text-xs font-medium text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-extrabold leading-none text-slate-950">{value}</p>
            <p className="mt-2 text-sm text-slate-400">{helper}</p>
        </Card>
    );
}

function Step({ number, title, children }) {
    return (
        <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-[#08bcbc]">
                {number}
            </div>
            <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{children}</p>
            </div>
        </div>
    );
}

function FacebookIcon({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M14.2 8.1V6.7c0-.7.5-1.1 1.2-1.1h1.6V2.7c-.8-.1-1.7-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5v1.1H7.2v3.2H10v8.2h3.4v-8.2h2.7l.4-3.2h-2.3Z" />
        </svg>
    );
}

function XIcon({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M14.7 10.6 21.4 3h-1.7l-5.8 6.6L9.3 3H4l7 10-7 8h1.7l6.1-7 4.9 7H22l-7.3-10.4Zm-2.1 2.4-.7-1L6.2 4.2h2.4l4.5 6.4.7 1 6 8.3h-2.4L12.6 13Z" />
        </svg>
    );
}

function TiktokIcon({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M16.2 3c.3 2.4 1.7 4.1 4 4.3v3.1a7.2 7.2 0 0 1-4-1.2v5.8c0 3.6-2.5 6-5.8 6-3 0-5.4-2-5.4-5 0-3.4 2.8-5.4 6.3-5v3.3c-1.5-.4-3 .3-3 1.7 0 1.1.9 1.9 2.1 1.9 1.3 0 2.3-.8 2.3-2.7V3h3.5Z" />
        </svg>
    );
}

function InstagramIcon({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="5" />
            <circle cx="12" cy="12" r="3.4" />
            <circle cx="16.8" cy="7.2" r="0.7" fill="currentColor" stroke="none" />
        </svg>
    );
}

function WhatsappIcon({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M19.1 4.9A9.8 9.8 0 0 0 3.7 16.7L2.4 21.5l4.9-1.3a9.8 9.8 0 0 0 4.7 1.2h.1a9.8 9.8 0 0 0 7-16.5Zm-7 14.8H12a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 1 1 12.1 19.7Zm4.4-6.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2s.9 2.3 1 2.5c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .2-1.1-.1-.2-.3-.3-.5-.4Z" />
        </svg>
    );
}

function MessengerIcon({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M12 3C6.9 3 3 6.6 3 11.4c0 2.7 1.3 5 3.4 6.5v3.1l3.1-1.7c.8.2 1.6.3 2.5.3 5.1 0 9-3.6 9-8.4S17.1 3 12 3Zm1 11.3-2.3-2.5-4.6 2.5 5.1-5.5 2.2 2.5 4.5-2.5-4.9 5.5Z" />
        </svg>
    );
}

function TelegramIcon({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M20.9 4.2 3.8 10.8c-1.1.4-1.1 1.1-.2 1.4l4.4 1.4 1.7 5.2c.2.6.4.8.7.8s.6-.1.9-.4l2.1-2 4.4 3.2c.8.5 1.4.2 1.6-.8L22 6.5c.3-1.3-.4-1.8-1.1-1.4ZM8.8 13.1l9.9-6.2c.5-.3.9-.1.5.2l-8.5 7.7-.3 3.2-1.6-4.9Z" />
        </svg>
    );
}

function CopyIcon({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
            <rect x="8" y="8" width="11" height="11" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

const SHARE_ICONS = {
    facebook: FacebookIcon,
    x: XIcon,
    tiktok: TiktokIcon,
    instagram: InstagramIcon,
    whatsapp: WhatsappIcon,
    messenger: MessengerIcon,
    telegram: TelegramIcon,
    copy: CopyIcon,
};

function ShareButton({ type, label, onClick }) {
    const Icon = SHARE_ICONS[type] ?? CopyIcon;
    const tones = {
        facebook: 'text-[#1877f2] hover:border-[#1877f2]/35 hover:bg-[#1877f2]/5',
        x: 'text-slate-950 hover:border-slate-400 hover:bg-slate-100',
        tiktok: 'text-slate-950 hover:border-slate-400 hover:bg-slate-100',
        instagram: 'text-pink-600 hover:border-pink-200 hover:bg-pink-50',
        whatsapp: 'text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50',
        messenger: 'text-sky-600 hover:border-sky-200 hover:bg-sky-50',
        telegram: 'text-blue-500 hover:border-blue-200 hover:bg-blue-50',
        copy: 'text-violet-600 hover:border-violet-200 hover:bg-violet-50',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:ring-offset-2 ${tones[type] ?? tones.copy}`}
        >
            <Icon />
        </button>
    );
}

export default function Show({ campaign }) {
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [toast, setToast] = useState(null);

    const reward = useMemo(() => currency(campaign.reward_amount), [campaign.reward_amount]);
    const remainingDays = daysLeft(campaign.expires_at) ?? DEMO_FALLBACKS.daysLeft;
    const shareMessage = useMemo(
        () => `Check out this campaign: ${campaign.title}. Join here: ${campaign.referral_url ?? ''}`.trim(),
        [campaign.referral_url, campaign.title],
    );

    const metrics = {
        participants: campaign.participants_count ?? DEMO_FALLBACKS.participants,
        clicks: campaign.click_count ?? DEMO_FALLBACKS.clicks,
        conversions: campaign.conversion_count ?? DEMO_FALLBACKS.conversions,
    };

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 1800);
    };

    const generateLink = () => {
        if (campaign.referral_url) {
            copyLink(campaign.referral_url);
            return;
        }

        setGenerating(true);

        router.post(`/campaigns/${campaign.slug ?? campaign.id}/referral-link`, {}, {
            preserveScroll: true,
            onFinish: () => setGenerating(false),
        });
    };

    const copyLink = async (url) => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        showToast('Referral link copied');
        window.setTimeout(() => setCopied(false), 1800);
    };

    const copyShareMessage = async (message) => {
        await navigator.clipboard.writeText(shareMessage);
        showToast(message);
    };

    const openShare = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const shareActions = campaign.referral_url ? [
        {
            type: 'facebook',
            label: 'Share on Facebook',
            onClick: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaign.referral_url)}`),
        },
        {
            type: 'x',
            label: 'Share on X',
            onClick: () => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`),
        },
        {
            type: 'tiktok',
            label: 'Share on TikTok',
            onClick: () => copyShareMessage('Copied for TikTok'),
        },
        {
            type: 'instagram',
            label: 'Share on Instagram',
            onClick: () => copyShareMessage('Copied for Instagram'),
        },
        {
            type: 'whatsapp',
            label: 'Share on WhatsApp',
            onClick: () => openShare(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`),
        },
        {
            type: 'messenger',
            label: 'Share on Messenger',
            onClick: () => copyShareMessage('Copied for Messenger'),
        },
        {
            type: 'telegram',
            label: 'Share on Telegram',
            onClick: () => openShare(`https://t.me/share/url?url=${encodeURIComponent(campaign.referral_url)}&text=${encodeURIComponent(shareMessage)}`),
        },
        {
            type: 'copy',
            label: 'Copy share message',
            onClick: () => copyShareMessage('Share message copied'),
        },
    ] : [];

    return (
        <ClientLayout>
            <Toast message={toast} />

            <div className="-mx-4 -mt-6 bg-[#f8fafc] sm:-mx-6 lg:-mx-8">
                <div className="border-b border-slate-200/80 bg-white px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Link href="/campaigns" className="flex items-center gap-2 font-medium text-slate-600 transition hover:text-slate-950">
                            <span aria-hidden="true">&lsaquo;</span>
                            Back
                        </Link>
                        <span className="h-5 w-px bg-slate-200" />
                        <span className="text-slate-400">Marketplace</span>
                        <span className="text-slate-300">&rsaquo;</span>
                        <span className="font-bold text-slate-950">{campaign.title}</span>
                    </div>
                </div>

                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <Hero campaign={campaign} reward={reward} remainingDays={remainingDays} />

                    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] xl:items-start">
                        <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <StatCard label="Reward" value={reward} helper="per conversion" />
                                <StatCard label="Participants" value={metrics.participants} helper="sharing now" />
                                <StatCard label="Total Clicks" value={compactNumber(metrics.clicks)} helper="this campaign" />
                                <StatCard label="Conversions" value={metrics.conversions} helper="verified" />
                            </div>

                            <Card className="p-6">
                                <h2 className="text-lg font-bold text-slate-950">About this campaign</h2>
                                <p className="mt-4 text-sm leading-7 text-slate-700">
                                    {campaign.description ?? 'This campaign is ready for participants to share and earn rewards on verified conversions.'}
                                </p>
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-lg font-bold text-slate-950">How it works</h2>
                                <div className="mt-6 space-y-5">
                                    <Step number="1" title="Join the campaign">
                                        Click &ldquo;Join & Get Link&rdquo; to generate your unique referral URL.
                                    </Step>
                                    <Step number="2" title="Share your link">
                                        Post it on social media, send to friends, or embed in your content.
                                    </Step>
                                    <Step number="3" title={`Earn ${reward} per business sign-up`}>
                                        Every verified business activation earns you {reward}, tracked automatically.
                                    </Step>
                                    <Step number="4" title="Get paid">
                                        Payouts are processed through your participant payout method once eligible.
                                    </Step>
                                </div>
                            </Card>
                        </div>

                        <aside className="space-y-4">
                            <Card className="p-6 text-center">
                                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Campaign active &middot; {remainingDays} days left
                                </div>

                                <p className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950">{reward}</p>
                                <p className="mt-2 text-sm text-slate-400">earned per verified conversion</p>

                                <button
                                    type="button"
                                    onClick={generateLink}
                                    disabled={generating}
                                    className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-700 px-4 text-sm font-extrabold text-white shadow-sm transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {generating ? 'Generating...' : campaign.referral_url ? (copied ? 'Copied!' : 'Copy My Link') : 'Join & Get My Link'}
                                </button>

                                {campaign.referral_url && (
                                    <div className="mt-4 space-y-4">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Your referral link</p>
                                            <div className="mt-2 flex gap-2">
                                                <input
                                                    readOnly
                                                    value={campaign.referral_url}
                                                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => copyLink(campaign.referral_url)}
                                                    className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-left">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-extrabold text-slate-950">Share this campaign</p>
                                                    <p className="mt-1 text-xs leading-5 text-slate-400">
                                                        Copy-ready message for TikTok, Instagram, and Messenger.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {shareActions.map((action) => (
                                                    <ShareButton
                                                        key={action.type}
                                                        type={action.type}
                                                        label={action.label}
                                                        onClick={action.onClick}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p className="mt-6 text-xs font-medium text-slate-400">Free to join &middot; No minimums required</p>
                            </Card>

                            <Card className="p-5">
                                <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-400">About the brand</h2>
                                <div className="mt-4 flex items-center gap-4">
                                    <BrandAvatar campaign={campaign} className="h-12 w-12 shrink-0 rounded-xl text-sm" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-950">{campaign.brand_name ?? 'Brand'}</p>
                                        <p className="mt-1 text-xs font-medium text-slate-400">{campaign.category ?? campaign.brand_industry ?? 'Campaign'}</p>
                                    </div>
                                </div>

                                <p className="mt-4 border-b border-slate-100 pb-4 text-sm leading-6 text-slate-600">
                                    {campaign.brand_description ?? `${campaign.brand_name ?? 'This brand'} is a trusted SharePlattr campaign partner.`}
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                                    <div>
                                        <p className="text-base font-extrabold text-slate-950">{DEMO_FALLBACKS.brandReach}</p>
                                        <p className="text-xs text-slate-400">businesses</p>
                                    </div>
                                    <div>
                                        <p className="text-base font-extrabold text-slate-950">{DEMO_FALLBACKS.brandRating}&#9733;</p>
                                        <p className="text-xs text-slate-400">brand rating</p>
                                    </div>
                                </div>
                            </Card>

                            <button type="button" className="mx-auto flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-slate-600">
                                <span aria-hidden="true">!</span>
                                Report this campaign
                            </button>
                        </aside>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
