import { Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Button from '../../Components/Button';
import Card from '../../Components/Card';
import Input from '../../Components/Input';
import ClientLayout from '../../Layouts/ClientLayout';

function formatReward(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

function displayUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

function initials(name = '') {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'SP';
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

function SocialIcon({ type }) {
    const classes = 'h-5 w-5';

    if (type === 'facebook') {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={classes} aria-hidden="true">
                <path d="M14 8.2V6.7c0-.7.5-1.1 1.2-1.1h1.6V2.8c-.8-.1-1.7-.2-2.5-.2-2.6 0-4.4 1.6-4.4 4.5v1.1H7.1v3.2h2.8v8h3.4v-8h2.7l.4-3.2H14Z" />
            </svg>
        );
    }

    if (type === 'x') {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={classes} aria-hidden="true">
                <path d="M14.5 10.6 21.1 3h-1.6l-5.7 6.6L9.2 3H4l6.9 9.9L4 21h1.6l6-7 4.8 7h5.2l-7.1-10.4Zm-2.1 2.5-.7-1L6.1 4.2h2.3l4.5 6.4.7 1 5.9 8.3h-2.3l-4.8-6.8Z" />
            </svg>
        );
    }

    if (type === 'instagram') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={classes} aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="5" />
                <circle cx="12" cy="12" r="3.4" />
                <circle cx="16.8" cy="7.2" r="0.7" fill="currentColor" stroke="none" />
            </svg>
        );
    }

    if (type === 'messenger') {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={classes} aria-hidden="true">
                <path d="M12 3.2c-5.1 0-9.2 3.7-9.2 8.3 0 2.6 1.3 4.9 3.4 6.4v3.2l3.1-1.7c.9.2 1.8.4 2.7.4 5.1 0 9.2-3.7 9.2-8.3S17.1 3.2 12 3.2Zm.9 11-2.3-2.5-4.5 2.5 5-5.4 2.3 2.5 4.5-2.5-5 5.4Z" />
            </svg>
        );
    }

    if (type === 'telegram') {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={classes} aria-hidden="true">
                <path d="M20.8 4.2 3.9 10.7c-1.1.4-1.1 1.1-.2 1.4l4.3 1.3 1.7 5.1c.2.6.3.8.7.8.3 0 .5-.1.8-.4l2.1-2 4.4 3.2c.8.4 1.3.2 1.5-.8l2.7-12.8c.3-1.2-.4-1.7-1.1-1.3ZM8.7 13.1l9.8-6.2c.5-.3.9-.1.5.2l-8.4 7.6-.3 3.2-1.6-4.8Z" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={classes} aria-hidden="true">
            <path d="M19.1 4.9A9.8 9.8 0 0 0 3.7 16.7L2.4 21.5l4.9-1.3a9.8 9.8 0 0 0 4.7 1.2h.1a9.8 9.8 0 0 0 7-16.5Zm-7 14.8H12a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 1 1 12.1 19.7Zm4.4-6.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2s.9 2.3 1 2.5c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .2-1.1-.1-.2-.3-.3-.5-.4Z" />
        </svg>
    );
}

function SocialIconButton({ type, label, onClick, disabled = false }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#26338c] shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-[#26338c]/30 hover:bg-[#eef2ff] hover:text-[#26338c] focus:outline-none focus:ring-2 focus:ring-[#26338c]/25 focus:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
        >
            <SocialIcon type={type} />
        </button>
    );
}

function CampaignHero({ campaign, destinationDisplay }) {
    const brandInitials = initials(campaign.brand_name || campaign.title);

    return (
        <section className="relative overflow-hidden rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70">
            {campaign.campaign_banner_url ? (
                <img
                    src={campaign.campaign_banner_url}
                    alt=""
                    className="h-[190px] w-full object-cover sm:h-[250px] lg:h-[320px]"
                />
            ) : (
                <div className="flex h-[190px] w-full items-center justify-center bg-[linear-gradient(135deg,#eef2ff_0%,#38bdf8_48%,#26338c_100%)] sm:h-[250px] lg:h-[320px]">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/90 text-3xl font-bold text-[#26338c] shadow-lg shadow-slate-950/10">
                        {brandInitials}
                    </div>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/32 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7 lg:p-8">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                    {campaign.brand_name && <span>{campaign.brand_name}</span>}
                    {campaign.category && <span className="rounded-full bg-white/16 px-2.5 py-1 normal-case tracking-normal backdrop-blur">{campaign.category}</span>}
                </div>
                <h1 className="mt-3 max-w-4xl text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {campaign.title}
                </h1>
                <p className="mt-3 text-sm font-medium text-white/82">Destination: {destinationDisplay}</p>
            </div>
        </section>
    );
}

export default function Show({ campaign, topPerformers = [] }) {
    const [copied, setCopied] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [toast, setToast] = useState(null);
    const destinationDisplay = useMemo(() => displayUrl(campaign.destination_url), [campaign.destination_url]);
    const brandWebsiteDisplay = useMemo(
        () => campaign.brand_website_url ? displayUrl(campaign.brand_website_url) : null,
        [campaign.brand_website_url],
    );
    const shareText = useMemo(() => {
        const brand = campaign.brand_name ? ` from ${campaign.brand_name}` : '';
        return `Check out ${campaign.title}${brand}. Use my link: ${campaign.referral_url ?? ''}`.trim();
    }, [campaign.brand_name, campaign.referral_url, campaign.title]);
    const xText = useMemo(() => {
        const brand = campaign.brand_name ? ` from ${campaign.brand_name}` : '';
        return `Check out ${campaign.title}${brand}. Use my link:`;
    }, [campaign.brand_name, campaign.title]);

    const generateLink = () => {
        setGenerating(true);

        router.post(`/campaigns/${campaign.slug ?? campaign.id}/referral-link`, {}, {
            preserveScroll: true,
            onFinish: () => setGenerating(false),
        });
    };

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 1800);
    };

    const copyToClipboard = async (value, key, message) => {
        await navigator.clipboard.writeText(value);
        setCopied(key);
        showToast(message);
        window.setTimeout(() => setCopied(null), 1800);
    };

    const openShare = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <ClientLayout>
            <Toast message={toast} />

            <div className="flex justify-end">
                <Button as={Link} href="/campaigns" variant="secondary">
                    Back to Campaigns
                </Button>
            </div>

            <CampaignHero campaign={campaign} destinationDisplay={destinationDisplay} />

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <Card className="p-6">
                        {campaign.brand_logo_url && (
                            <div className="mb-4 flex items-center gap-3">
                                <img src={campaign.brand_logo_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                                <p className="text-sm font-semibold text-slate-500">{campaign.brand_name}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                            {campaign.category && (
                                <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                                    {campaign.category}
                                </span>
                            )}
                            <span className="text-sm text-slate-500">Destination: {destinationDisplay}</span>
                        </div>

                        <p className="mt-6 text-base leading-8 text-slate-700">{campaign.description}</p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            {campaign.brand_logo_url ? (
                                <img src={campaign.brand_logo_url} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
                            ) : (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-lg font-bold text-[#26338c]">
                                    {initials(campaign.brand_name)}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-semibold text-slate-950">Brand Details</h2>
                                    {campaign.category && (
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            {campaign.category}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-xl font-semibold text-slate-950">{campaign.brand_name}</p>
                                {campaign.brand_industry && (
                                    <p className="mt-1 text-sm font-medium text-slate-500">{campaign.brand_industry}</p>
                                )}
                                {campaign.brand_description && (
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{campaign.brand_description}</p>
                                )}
                                {(campaign.brand_website_url || campaign.destination_url) && (
                                    <a
                                        href={campaign.brand_website_url ?? campaign.destination_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex text-sm font-semibold text-[#26338c] transition hover:text-blue-600"
                                    >
                                        {brandWebsiteDisplay ?? destinationDisplay}
                                    </a>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-slate-950">How it works</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-950">1. Generate</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Create your unique referral link for this campaign.</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-950">2. Share</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Send the link to your audience or customers.</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-950">3. Earn</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">A verified conversion creates a pending reward.</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="h-fit p-6">
                    <p className="text-sm font-medium text-slate-500">Reward</p>
                    <p className="mt-2 text-4xl font-semibold text-slate-950">{formatReward(campaign.reward_amount)}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Paid as a pending reward after an admin records a verified conversion.
                    </p>

                    <div className="mt-6 border-t border-slate-100 pt-6">
                        {campaign.referral_url ? (
                            <div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-950">Share this campaign</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <SocialIconButton
                                            type="facebook"
                                            label="Share on Facebook"
                                            onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaign.referral_url)}`)}
                                        />
                                        <SocialIconButton
                                            type="x"
                                            label="Share on X"
                                            onClick={() => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(campaign.referral_url)}`)}
                                        />
                                        <SocialIconButton
                                            type="instagram"
                                            label="Copy message for Instagram"
                                            onClick={() => copyToClipboard(shareText, 'instagram', 'Message copied. You can paste it into Instagram/Messenger.')}
                                        />
                                        <SocialIconButton
                                            type="messenger"
                                            label="Copy message for Messenger"
                                            onClick={() => copyToClipboard(shareText, 'messenger', 'Message copied. You can paste it into Instagram/Messenger.')}
                                        />
                                        <SocialIconButton
                                            type="telegram"
                                            label="Share on Telegram"
                                            onClick={() => openShare(`https://t.me/share/url?url=${encodeURIComponent(campaign.referral_url)}&text=${encodeURIComponent(xText)}`)}
                                        />
                                        <SocialIconButton
                                            type="whatsapp"
                                            label="Share on WhatsApp"
                                            onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(shareText)}`)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant={copied === 'message' ? 'subtle' : 'secondary'}
                                        onClick={() => copyToClipboard(shareText, 'message', 'Message copied')}
                                        className="mt-3 w-full"
                                    >
                                        {copied === 'message' ? 'Message Copied' : 'Copy Message'}
                                    </Button>
                                </div>

                                <div className="mt-6 border-t border-slate-100 pt-5">
                                    <p className="text-sm font-semibold text-slate-950">Your referral link</p>
                                    <Input readOnly value={campaign.referral_url} className="mt-2 truncate bg-slate-50 font-mono text-xs" />
                                    <Button
                                        type="button"
                                        variant={copied === 'link' ? 'subtle' : 'secondary'}
                                        onClick={() => copyToClipboard(campaign.referral_url, 'link', 'Link copied')}
                                        className="mt-3 w-full"
                                    >
                                        {copied === 'link' ? 'Copied' : 'Copy Link'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm font-semibold text-slate-950">Share this campaign</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Generate your referral link to unlock social sharing.</p>
                                <Button
                                    type="button"
                                    onClick={generateLink}
                                    disabled={generating}
                                    className="mt-4 w-full"
                                >
                                    {generating ? 'Generating...' : 'Generate Link'}
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Card className="mt-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">Top Performers</h2>
                        <p className="mt-1 text-sm text-slate-500">Highest earners for this campaign.</p>
                    </div>
                </div>

                {topPerformers.length === 0 ? (
                    <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
                        No performance data yet.
                    </p>
                ) : (
                    <div className="mt-5 grid gap-3 lg:grid-cols-3">
                        {topPerformers.map((performer) => (
                            <article
                                key={performer.rank}
                                className={`rounded-xl border p-4 ${performer.rank === 1 ? 'border-[#26338c]/20 bg-[#eef2ff]' : 'border-slate-200 bg-white'}`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${performer.rank === 1 ? 'bg-[#26338c] text-white' : 'bg-slate-100 text-slate-700'}`}>
                                            {performer.initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-950">{performer.user_name}</p>
                                            <p className="text-xs text-slate-500">{performer.conversions_count} conversions</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-[#26338c]">#{performer.rank}</span>
                                </div>
                                <p className="mt-4 text-2xl font-semibold text-slate-950">{formatReward(performer.total_earnings)}</p>
                                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-[linear-gradient(90deg,#26338c_0%,#38bdf8_100%)]"
                                        style={{ width: `${Math.max(performer.bar_percent, 6)}%` }}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </Card>
        </ClientLayout>
    );
}
