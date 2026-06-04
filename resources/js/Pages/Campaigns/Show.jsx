import { Link, router } from '@inertiajs/react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ClientLayout from '../../Layouts/ClientLayout';
import BusinessLayout from '../../Layouts/BusinessLayout';
import CopyCampaignLinkButton from '../../Components/CopyCampaignLinkButton';
import ConversionLabel from '../../Components/ConversionLabel';
import ImageWithFallback from '../../Components/ImageWithFallback';
import { formatExpiryDate } from '../../Support/dates';
import { formatReward } from '../../Support/rewards';
import usePollingStats from '../../Support/usePollingStats';

const genericCampaignTerms = 'Standard SharePlattr referral participation terms apply. Rewards are subject to verification, campaign availability, eligibility checks, and fraud review. Rewards may be rejected for self-referrals, duplicate activity, invalid conversions, or activity outside the campaign requirements.';

function compactNumber(value) {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
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
    return (
        <ImageWithFallback
            src={campaign.brand_logo_url}
            alt=""
            fallbackLabel={campaign.brand_name || campaign.title}
            className={`object-cover ${className}`}
            showFallbackText={false}
        />
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

function Hero({ campaign, reward }) {
    const expiryLabel = formatExpiryDate(campaign.expires_at, null);
    const hasBanner = Boolean(campaign.campaign_banner && campaign.campaign_banner_url);

    return (
        <section className="relative min-h-[255px] overflow-hidden rounded-none bg-slate-900 sm:rounded-2xl">
            {hasBanner ? (
                <img
                    src={campaign.campaign_banner_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#111827_52%,#020617_100%)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/38 to-black/12" />

            <div className="relative flex min-h-[255px] flex-col justify-between gap-5 p-5 pt-6 text-white sm:p-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2 lg:mb-2">
                        {campaign.category && (
                            <span className="rounded-full bg-[#08bcbc]/90 px-3 py-1 text-xs font-bold text-white">
                                {campaign.category}
                            </span>
                        )}
                        <span className="text-xs font-semibold text-white/85">by {campaign.brand_name ?? 'SharePlattr brand'}</span>
                    </div>
                    <div className="flex min-w-0 items-center gap-4 lg:items-end">
                        <BrandAvatar campaign={campaign} className="h-14 w-14 shrink-0 rounded-2xl bg-white text-lg shadow-xl ring-1 ring-white/70 sm:h-16 sm:w-16" />
                        <div className="min-w-0 lg:pb-1">
                            <h1 className="line-clamp-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                {campaign.title}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Pill className="bg-white/18 ring-1 ring-white/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active
                    </Pill>
                    <Pill className="bg-white/18 ring-1 ring-white/25">
                        {reward} / conversion
                    </Pill>
                    {expiryLabel && (
                        <Pill className="bg-white/18 ring-1 ring-white/25">
                            {expiryLabel}
                        </Pill>
                    )}
                </div>
            </div>
        </section>
    );
}

function StatCard({ label, value, helper }) {
    return (
        <Card className="p-4 xl:p-5">
            <p className="text-xs font-medium text-slate-400">
                {label === 'Conversions' ? <ConversionLabel>{label}</ConversionLabel> : label}
            </p>
            <p className="mt-2 text-xl font-extrabold leading-none text-slate-950 xl:text-2xl">{value}</p>
            <p className="mt-1 text-xs text-slate-400 xl:mt-2 xl:text-sm">{helper}</p>
        </Card>
    );
}

function Step({ number, title, children }) {
    return (
        <div className="flex gap-3 xl:gap-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-[#08bcbc] xl:h-8 xl:w-8 xl:text-sm">
                {number}
            </div>
            <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-600 xl:leading-6">{children}</p>
            </div>
        </div>
    );
}

function MetadataBlock({ title, children }) {
    if (!children) {
        return null;
    }

    return (
        <div>
            <h3 className="text-sm font-bold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
        </div>
    );
}

function rewardTypeLabel(campaign) {
    return 'Cash reward';
}

function rewardAmountLabel(campaign, reward) {
    if ((campaign.reward_type ?? 'flat') === 'percentage') {
        return `${reward} of verified conversion value`;
    }

    return `${reward} per verified referral`;
}

function RewardSummaryCard({ campaign, reward, className = 'mt-5' }) {
    const mobileRewardQualifier = (campaign.reward_type ?? 'flat') === 'percentage'
        ? 'of verified conversion value'
        : 'per verified referral';

    return (
        <div className={`${className} rounded-xl border border-cyan-200 bg-cyan-50/80 p-3 text-left shadow-sm shadow-cyan-900/5 xl:p-4`}>
            <div className="xl:hidden">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-cyan-700">Reward</p>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                        {rewardTypeLabel(campaign)}
                    </span>
                </div>
                <div className="mt-1.5">
                    <p className="text-2xl font-extrabold leading-none tracking-tight text-slate-950">{reward}</p>
                    <p className="mt-1 text-sm font-bold leading-5 text-slate-700">{mobileRewardQualifier}</p>
                </div>
            </div>

            <div className="hidden items-start justify-between gap-3 xl:flex">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-cyan-700">Reward</p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{rewardAmountLabel(campaign, reward)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                    {rewardTypeLabel(campaign)}
                </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-700 xl:mt-3 xl:text-sm">
                Paid after the referral completes the required action and the conversion is verified.
            </p>

            <details className="mt-2 rounded-lg bg-white/70 px-2.5 py-2 text-xs text-slate-600 xl:mt-3 xl:px-3 xl:text-sm">
                <summary className="cursor-pointer select-none font-bold text-slate-950">How rewards work</summary>
                <p className="mt-1.5 leading-5 xl:mt-2">
                    Rewards are reviewed and paid after the referral action is verified. Final approval depends on campaign terms.
                </p>
            </details>
        </div>
    );
}

function CampaignTermsBlock({ terms }) {
    const campaignTerms = terms?.trim() || genericCampaignTerms;

    return (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-950/5">
            <p className="text-sm font-extrabold text-slate-950">Campaign Terms</p>
            <details className="mt-2">
                <summary className="cursor-pointer select-none text-sm font-bold text-[#08bcbc]">
                    View campaign terms
                </summary>
                <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                    <p className="whitespace-pre-line">{campaignTerms}</p>
                    <Link href="/terms-of-use" className="inline-flex font-bold text-slate-950 underline underline-offset-4">
                        Terms of Service
                    </Link>
                </div>
            </details>
        </div>
    );
}

function FacebookIcon({ className = 'h-4 w-4' }) {
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M14.2 8.1V6.7c0-.7.5-1.1 1.2-1.1h1.6V2.7c-.8-.1-1.7-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5v1.1H7.2v3.2H10v8.2h3.4v-8.2h2.7l.4-3.2h-2.3Z" /></svg>;
}

function XIcon({ className = 'h-4 w-4' }) {
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M14.7 10.6 21.4 3h-1.7l-5.8 6.6L9.3 3H4l7 10-7 8h1.7l6.1-7 4.9 7H22l-7.3-10.4Zm-2.1 2.4-.7-1L6.2 4.2h2.4l4.5 6.4.7 1 6 8.3h-2.4L12.6 13Z" /></svg>;
}

function InstagramIcon({ className = 'h-4 w-4' }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.4" /><circle cx="16.8" cy="7.2" r="0.7" fill="currentColor" stroke="none" /></svg>;
}

function TiktokIcon({ className = 'h-4 w-4' }) {
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M16.2 3c.3 2.4 1.7 4.1 4 4.3v3.1a7.2 7.2 0 0 1-4-1.2v5.8c0 3.6-2.5 6-5.8 6-3 0-5.4-2-5.4-5 0-3.4 2.8-5.4 6.3-5v3.3c-1.5-.4-3 .3-3 1.7 0 1.1.9 1.9 2.1 1.9 1.3 0 2.3-.8 2.3-2.7V3h3.5Z" /></svg>;
}

function MessengerIcon({ className = 'h-4 w-4' }) {
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 3C6.9 3 3 6.6 3 11.4c0 2.7 1.3 5 3.4 6.5v3.1l3.1-1.7c.8.2 1.6.3 2.5.3 5.1 0 9-3.6 9-8.4S17.1 3 12 3Zm1 11.3-2.3-2.5-4.6 2.5 5.1-5.5 2.2 2.5 4.5-2.5-4.9 5.5Z" /></svg>;
}

function WhatsappIcon({ className = 'h-4 w-4' }) {
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M19.1 4.9A9.8 9.8 0 0 0 3.7 16.7L2.4 21.5l4.9-1.3a9.8 9.8 0 0 0 4.7 1.2h.1a9.8 9.8 0 0 0 7-16.5Zm-7 14.8H12a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 1 1 12.1 19.7Zm4.4-6.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2s.9 2.3 1 2.5c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .2-1.1-.1-.2-.3-.3-.5-.4Z" /></svg>;
}

function TelegramIcon({ className = 'h-4 w-4' }) {
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M20.9 4.2 3.8 10.8c-1.1.4-1.1 1.1-.2 1.4l4.4 1.4 1.7 5.2c.2.6.4.8.7.8s.6-.1.9-.4l2.1-2 4.4 3.2c.8.5 1.4.2 1.6-.8L22 6.5c.3-1.3-.4-1.8-1.1-1.4ZM8.8 13.1l9.9-6.2c.5-.3.9-.1.5.2l-8.5 7.7-.3 3.2-1.6-4.9Z" /></svg>;
}

function DiscordIcon({ className = 'h-4 w-4' }) {
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M19.5 5.3A16 16 0 0 0 15.6 4l-.2.4c1.4.4 2.1 1 2.1 1s-1.9-1-5.5-1-5.5 1-5.5 1 .7-.6 2.1-1L8.4 4a16 16 0 0 0-3.9 1.3C2 9.1 1.4 12.8 1.7 16.5A15.7 15.7 0 0 0 6.6 19l.9-1.2c-.5-.2-1-.5-1.5-.8l.4-.3c2.9 1.3 6.1 1.3 9.1 0l.4.3c-.5.3-1 .6-1.5.8l.9 1.2a15.7 15.7 0 0 0 4.9-2.5c.4-4.3-.7-7.9-2.7-11.2ZM8.5 14.2c-.9 0-1.6-.8-1.6-1.7s.7-1.7 1.6-1.7 1.6.8 1.6 1.7-.7 1.7-1.6 1.7Zm7 0c-.9 0-1.6-.8-1.6-1.7s.7-1.7 1.6-1.7 1.6.8 1.6 1.7-.7 1.7-1.6 1.7Z" /></svg>;
}

function EmailIcon({ className = 'h-4 w-4' }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m5 8 7 5 7-5" /></svg>;
}

function ShareButton({ label, source, icon: Icon, onClick }) {
    return (
        <button type="button" onClick={onClick} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/25" aria-label={label} title={label}>
            <Icon />
            <span>{source}</span>
        </button>
    );
}

const celebrationParticles = [
    { left: '12%', top: '24%', color: '#08bcbc', delay: '0ms' },
    { left: '24%', top: '14%', color: '#8b5cf6', delay: '110ms' },
    { left: '42%', top: '22%', color: '#f59e0b', delay: '70ms' },
    { left: '64%', top: '13%', color: '#ec4899', delay: '150ms' },
    { left: '82%', top: '25%', color: '#10b981', delay: '40ms' },
    { left: '72%', top: '43%', color: '#06b6d4', delay: '210ms' },
];

function CelebrationPanel({ campaignTitle, justJoined }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-4 text-left shadow-sm shadow-cyan-900/5">
            <style>{`
                @keyframes shareplattr-check-pop {
                    0% { opacity: 0; transform: scale(.72) rotate(-10deg); }
                    70% { opacity: 1; transform: scale(1.08) rotate(3deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                @keyframes shareplattr-confetti-float {
                    0% { opacity: 0; transform: translateY(0) rotate(0deg) scale(.8); }
                    20% { opacity: 1; }
                    100% { opacity: 0; transform: translateY(32px) rotate(150deg) scale(1); }
                }
            `}</style>

            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                {celebrationParticles.map((particle) => (
                    <span
                        key={`${particle.left}-${particle.top}`}
                        className="absolute h-2 w-1.5 rounded-full"
                        style={{
                            left: particle.left,
                            top: particle.top,
                            backgroundColor: particle.color,
                            animation: `shareplattr-confetti-float 900ms ease-out ${particle.delay} both`,
                        }}
                    />
                ))}
            </div>

            <div className="relative flex items-start gap-3">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#08bcbc] text-white shadow-sm shadow-cyan-900/20"
                    style={{ animation: 'shareplattr-check-pop 520ms cubic-bezier(.2,.8,.2,1) both' }}
                    aria-hidden="true"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-5 w-5">
                        <path d="m5 12.5 4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <p className="text-base font-extrabold text-slate-950">
                        {justJoined ? "You're in! 🎉" : "You're already in"}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                        {justJoined ? `You've joined ${campaignTitle}!` : `${campaignTitle} is ready to share.`}
                    </p>
                </div>
            </div>
        </div>
    );
}

function messageWithLink(message, url) {
    const normalized = (message ?? '').trim();

    if (!url) {
        return normalized;
    }

    if (normalized.includes(url)) {
        return normalized;
    }

    return `${normalized}${normalized ? '\n\n' : ''}${url}`;
}

export default function Show({ campaign, businessPreview = false }) {
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [justJoined, setJustJoined] = useState(false);
    const [toast, setToast] = useState(null);
    const [shareMessageText, setShareMessageText] = useState(campaign.share_message ?? '');
    const [shareTab, setShareTab] = useState('link');
    const [payoutPromptDismissed, setPayoutPromptDismissed] = useState(false);
    const qrCodeRef = useRef(null);
    const Layout = businessPreview ? BusinessLayout : ClientLayout;
    const statsUrl = businessPreview
        ? `/business/campaigns/${campaign.id}/stats-summary`
        : `/campaigns/${campaign.slug ?? campaign.id}/stats-summary`;
    const { stats: liveStats, lastUpdatedAt } = usePollingStats(statsUrl, {
        campaign_click_count: campaign.click_count,
        click_count: campaign.click_count,
        conversion_count: campaign.conversion_count,
        participants_count: campaign.participants_count,
    });

    const reward = useMemo(() => formatReward(campaign), [campaign]);
    const expiryLabel = formatExpiryDate(campaign.expires_at, null);
    const metrics = {
        participants: liveStats?.participants_count ?? campaign.participants_count ?? 0,
        clicks: liveStats?.click_count ?? liveStats?.campaign?.click_count ?? campaign.click_count ?? 0,
        conversions: liveStats?.conversion_count ?? liveStats?.campaign?.conversion_count ?? campaign.conversion_count ?? 0,
    };
    const brandCampaignsLaunched = Number(campaign.brand_stats?.campaigns_launched ?? 0);

    const referralUrl = (source = 'copy') => {
        if (!campaign.referral_url) {
            return '';
        }

        const url = new URL(campaign.referral_url, window.location.origin);
        url.searchParams.set('source', source);

        return url.toString();
    };
    const fullReferralUrl = campaign.referral_url ? referralUrl('copy') : '';
    const qrReferralUrl = campaign.referral_url ? referralUrl('qr') : '';
    const shortReferralUrl = fullReferralUrl.replace(/^https?:\/\//, '');
    const referralToken = useMemo(() => {
        if (!campaign.referral_url) {
            return 'link';
        }

        try {
            const url = new URL(campaign.referral_url, window.location.origin);

            return url.pathname.split('/').filter(Boolean).pop() || 'link';
        } catch (error) {
            return 'link';
        }
    }, [campaign.referral_url]);
    const isMobileDevice = useMemo(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent || '');
    }, []);
    const qrDownloadLabel = isMobileDevice ? 'Save to Photos' : 'Download QR Code';

    useEffect(() => {
        setShareMessageText(campaign.share_message ?? '');
    }, [campaign.share_message]);

    const payoutPromptKey = `dismissedPayoutPrompt:${campaign.id}`;

    useEffect(() => {
        setPayoutPromptDismissed(window.sessionStorage.getItem(payoutPromptKey) === 'true');
    }, [payoutPromptKey]);

    const showToast = (message, duration = 1800) => {
        setToast(message);
        window.setTimeout(() => setToast(null), duration);
    };

    const generateLink = () => {
        if (campaign.referral_url) {
            copyLink(fullReferralUrl);
            return;
        }

        setGenerating(true);

        router.post(`/campaigns/${campaign.slug ?? campaign.id}/referral-link`, {}, {
            preserveScroll: true,
            onSuccess: () => setJustJoined(true),
            onFinish: () => setGenerating(false),
        });
    };

    const copyLink = async (url) => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        showToast('Referral link copied');
        window.setTimeout(() => setCopied(false), 2000);
    };

    const dismissPayoutPrompt = () => {
        window.sessionStorage.setItem(payoutPromptKey, 'true');
        setPayoutPromptDismissed(true);
    };

    const composedMessage = (source = 'copy') => {
        const baseUrl = campaign.referral_url ?? '';
        const copyUrl = referralUrl('copy');
        const sourceUrl = referralUrl(source);
        let message = shareMessageText;

        if (baseUrl && message.includes(baseUrl)) {
            message = message.replaceAll(baseUrl, sourceUrl);
        } else if (message.includes(copyUrl)) {
            message = message.replaceAll(copyUrl, sourceUrl);
        }

        return messageWithLink(message, sourceUrl);
    };

    const copyMessage = async (source = 'copy', label = 'Share message') => {
        await navigator.clipboard.writeText(composedMessage(source));
        showToast(`${label} copied`);
    };

    const downloadQrCode = () => {
        const canvas = qrCodeRef.current;

        if (!canvas) {
            return;
        }

        const link = document.createElement('a');

        link.href = canvas.toDataURL('image/png');
        link.download = `shareplattr-referral-${referralToken}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast(isMobileDevice ? 'QR code ready to save' : 'QR code downloaded');
    };

    const openShare = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const emailSubject = () => {
        const businessName = campaign.brand_name?.trim();

        return businessName ? `I thought you'd like ${businessName}` : "I thought you'd like this";
    };

    const handleEmailShare = () => {
        const subject = emailSubject();
        const body = composedMessage('email');
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        showToast('Opening your email client. If nothing opens, copy the message manually.', 3200);
        window.location.href = mailtoUrl;
    };

    const handleInstagramShare = async () => {
        const instagramWebUrl = 'https://www.instagram.com/';
        const instagramAppUrl = 'instagram://app';
        const message = composedMessage('instagram');
        let copiedToClipboard = false;

        try {
            await navigator.clipboard.writeText(message);
            copiedToClipboard = true;
        } catch (error) {
            copiedToClipboard = false;
        }

        const userAgent = window.navigator.userAgent || '';
        const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
        const feedback = copiedToClipboard
            ? 'Message and link copied. Paste it into Instagram.'
            : 'Copy failed. Select the message or referral link, then paste it into Instagram.';

        showToast(feedback, 3200);

        if (!isMobile) {
            openShare(instagramWebUrl);
            return;
        }

        let pageHidden = false;
        const markHidden = () => {
            pageHidden = true;
        };

        document.addEventListener('visibilitychange', markHidden, { once: true });
        window.location.href = instagramAppUrl;

        window.setTimeout(() => {
            document.removeEventListener('visibilitychange', markHidden);

            if (!pageHidden) {
                window.location.href = instagramWebUrl;
            }
        }, 900);
    };

    const nativeShare = async () => {
        const text = composedMessage('direct');

        if (navigator.share) {
            await navigator.share({
                title: campaign.title,
                text,
                url: referralUrl('direct'),
            });
            return;
        }

        await copyMessage('direct', 'Share message');
    };

    const socialShares = [
        {
            label: 'Share on Facebook',
            source: 'Facebook',
            icon: FacebookIcon,
            onClick: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl('facebook'))}`),
        },
        {
            label: 'Share on X',
            source: 'X',
            icon: XIcon,
            onClick: () => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(composedMessage('x'))}`),
        },
        {
            label: 'Share by Email',
            source: 'Email',
            icon: EmailIcon,
            onClick: handleEmailShare,
        },
        {
            label: 'Copy message & open Instagram',
            source: 'Instagram',
            icon: InstagramIcon,
            onClick: handleInstagramShare,
        },
        {
            label: 'Copy TikTok message',
            source: 'TikTok',
            icon: TiktokIcon,
            onClick: () => copyMessage('tiktok', 'TikTok message'),
        },
    ];
    const messageShares = [
        {
            label: 'Copy Messenger message',
            source: 'Messenger',
            icon: MessengerIcon,
            onClick: () => copyMessage('messenger', 'Messenger message'),
        },
        {
            label: 'Share on WhatsApp',
            source: 'WhatsApp',
            icon: WhatsappIcon,
            onClick: () => openShare(`https://wa.me/?text=${encodeURIComponent(composedMessage('whatsapp'))}`),
        },
        {
            label: 'Share on Telegram',
            source: 'Telegram',
            icon: TelegramIcon,
            onClick: () => openShare(`https://t.me/share/url?url=${encodeURIComponent(referralUrl('telegram'))}&text=${encodeURIComponent(composedMessage('telegram'))}`),
        },
        {
            label: 'Copy Discord message',
            source: 'Discord',
            icon: DiscordIcon,
            onClick: () => copyMessage('discord', 'Discord message'),
        },
    ];
    const showPayoutPrompt = !businessPreview
        && Boolean(campaign.referral_url)
        && !campaign.has_payout_method
        && !payoutPromptDismissed;
    const mobileContentGutters = 'px-4 sm:px-6 lg:px-8';

    const statsGrid = (
        <>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
                <StatCard label="Reward" value={reward} helper="per conversion" />
                <StatCard label="Participants" value={metrics.participants} helper="sharing now" />
                <StatCard label="Total Clicks" value={compactNumber(metrics.clicks)} helper="this campaign" />
                <StatCard label="Conversions" value={metrics.conversions} helper="verified" />
            </div>
            {lastUpdatedAt && (
                <p className="-mt-1 text-xs font-medium text-slate-400 xl:-mt-3">
                    Last updated {lastUpdatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                </p>
            )}
        </>
    );

    const payoutPromptCard = showPayoutPrompt && (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-left">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-extrabold text-slate-950">Set up payouts</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                        Set up your payout method so you can receive your rewards.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={dismissPayoutPrompt}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
                    aria-label="Dismiss payout setup prompt"
                >
                    x
                </button>
            </div>
            <Link
                href={campaign.payout_settings_url ?? '/payouts'}
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
                Set up payout method
            </Link>
        </div>
    );

    const sharePanel = (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left">
            <p className="text-sm font-extrabold text-slate-950">Share this campaign</p>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {[
                    ['link', 'Share Link'],
                    ['qr', 'QR Code'],
                ].map(([tab, label]) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setShareTab(tab)}
                        className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${shareTab === tab ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                {shareTab === 'link' ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Your referral link</p>
                            <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                                <p className="min-w-0 flex-1 truncate font-mono text-xs text-slate-600">{shortReferralUrl}</p>
                                <button
                                    type="button"
                                    onClick={() => copyLink(fullReferralUrl)}
                                    className="shrink-0 rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
                                >
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Message</p>
                            <textarea
                                value={shareMessageText}
                                onChange={(event) => setShareMessageText(event.target.value)}
                                rows="6"
                                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                            />
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => copyMessage('copy')}
                                    className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                                >
                                    Copy message
                                </button>
                                <button
                                    type="button"
                                    onClick={nativeShare}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                                >
                                    Share
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Social</p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {socialShares.map((action) => (
                                    <ShareButton key={action.source} {...action} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Messaging</p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {messageShares.map((action) => (
                                    <ShareButton key={action.source} {...action} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 text-center">
                        <p className="text-sm leading-5 text-slate-600">
                            Let someone scan this code to open your referral link.
                        </p>
                        <div className="mx-auto flex h-40 w-40 max-w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:h-48 sm:w-48">
                            <QRCodeCanvas
                                ref={qrCodeRef}
                                value={qrReferralUrl}
                                size={180}
                                marginSize={4}
                                level="H"
                                className="h-full max-h-[160px] w-full max-w-[160px] sm:max-h-[180px] sm:max-w-[180px]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={downloadQrCode}
                            className="w-full rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                            {qrDownloadLabel}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const mobileReferralCard = !businessPreview && (
        <Card className="p-4">
            {campaign.referral_url ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-extrabold text-slate-950">Your referral link</p>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            Joined campaign
                        </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                        <p className="truncate font-mono text-xs text-slate-600">{shortReferralUrl}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => copyLink(fullReferralUrl)}
                            className="h-11 rounded-xl bg-slate-950 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800"
                        >
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <button
                            type="button"
                            onClick={nativeShare}
                            className="h-11 rounded-xl border border-cyan-200 bg-cyan-50 px-3 text-xs font-extrabold text-cyan-700 transition hover:bg-cyan-100"
                        >
                            Share
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className="text-sm font-extrabold text-slate-950">Your referral link</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">Join this campaign to generate your unique share link.</p>
                    <button
                        type="button"
                        onClick={generateLink}
                        disabled={generating}
                        className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-700 px-4 text-sm font-extrabold text-white shadow-sm transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {generating ? 'Generating...' : 'Join & Get My Link'}
                    </button>
                </div>
            )}
        </Card>
    );

    const mobileSharePanel = !businessPreview && campaign.referral_url && (
        <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-950">Share</h2>
                <button
                    type="button"
                    onClick={nativeShare}
                    className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                    Share
                </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => copyLink(fullReferralUrl)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                >
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                    type="button"
                    onClick={() => copyMessage('copy')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                >
                    Copy Message
                </button>
            </div>
            <details className="mt-3 rounded-xl bg-slate-50 p-3">
                <summary className="cursor-pointer select-none text-sm font-bold text-slate-950">More sharing options</summary>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    {[...socialShares, ...messageShares].map((action) => (
                        <ShareButton key={action.source} {...action} />
                    ))}
                </div>
            </details>
        </Card>
    );

    const howItWorksCard = (
        <Card className="p-4 xl:p-6">
            <h2 className="text-base font-bold text-slate-950 xl:text-lg">How it works</h2>
            <div className="mt-4 space-y-4 xl:mt-6 xl:space-y-5">
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
    );

    const campaignDetails = campaign.requirements || campaign.deliverables || campaign.participant_instructions || campaign.payout_details;
    const campaignInformation = (
        <>
            <Card className="p-6">
                <h2 className="text-lg font-bold text-slate-950">About this campaign</h2>
                <p className="mt-4 text-sm leading-7 text-slate-700">
                    {campaign.description ?? 'This campaign is ready for participants to share and earn rewards on verified conversions.'}
                </p>
            </Card>

            {campaignDetails && (
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-slate-950">Campaign details</h2>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <MetadataBlock title="Requirements">{campaign.requirements}</MetadataBlock>
                        <MetadataBlock title="Deliverables">{campaign.deliverables}</MetadataBlock>
                        <MetadataBlock title="Instructions">{campaign.participant_instructions}</MetadataBlock>
                        <MetadataBlock title="Payout notes">{campaign.payout_details}</MetadataBlock>
                    </div>
                </Card>
            )}
        </>
    );

    const mobileCampaignInformation = (
        <Card className="p-4">
            <h2 className="text-base font-bold text-slate-950">Campaign information</h2>
            <details className="mt-3 rounded-xl bg-slate-50 p-3" open>
                <summary className="cursor-pointer select-none text-sm font-bold text-slate-950">About this campaign</summary>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                    {campaign.description ?? 'This campaign is ready for participants to share and earn rewards on verified conversions.'}
                </p>
            </details>
            {campaignDetails && (
                <details className="mt-3 rounded-xl bg-slate-50 p-3">
                    <summary className="cursor-pointer select-none text-sm font-bold text-slate-950">Campaign details</summary>
                    <div className="mt-3 grid gap-4">
                        <MetadataBlock title="Requirements">{campaign.requirements}</MetadataBlock>
                        <MetadataBlock title="Deliverables">{campaign.deliverables}</MetadataBlock>
                        <MetadataBlock title="Instructions">{campaign.participant_instructions}</MetadataBlock>
                        <MetadataBlock title="Payout notes">{campaign.payout_details}</MetadataBlock>
                    </div>
                </details>
            )}
        </Card>
    );

    const brandCard = (
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

            {(campaign.commission_details || campaign.cookie_duration || campaign.network_platform || campaign.brand_country_region) && (
                <dl className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
                    {campaign.commission_details && (
                        <div>
                            <dt className="font-semibold text-slate-950">Commission</dt>
                            <dd className="mt-1 text-slate-600">{campaign.commission_details}</dd>
                        </div>
                    )}
                    {campaign.cookie_duration && (
                        <div>
                            <dt className="font-semibold text-slate-950">Cookie duration</dt>
                            <dd className="mt-1 text-slate-600">{campaign.cookie_duration}</dd>
                        </div>
                    )}
                    {campaign.network_platform && (
                        <div>
                            <dt className="font-semibold text-slate-950">Network</dt>
                            <dd className="mt-1 text-slate-600">{campaign.network_platform}</dd>
                        </div>
                    )}
                    {campaign.brand_country_region && (
                        <div>
                            <dt className="font-semibold text-slate-950">Region</dt>
                            <dd className="mt-1 text-slate-600">{campaign.brand_country_region}</dd>
                        </div>
                    )}
                </dl>
            )}

            {brandCampaignsLaunched > 1 ? (
                <div className="mt-4 border-t border-slate-100 pt-4 text-center">
                    <p className="text-base font-extrabold text-slate-950">{brandCampaignsLaunched}</p>
                    <p className="text-xs text-slate-400">campaigns launched</p>
                </div>
            ) : (
                <p className="mt-4 border-t border-slate-100 pt-4 text-center text-xs font-semibold text-slate-400">
                    New to SharePlattr
                </p>
            )}
        </Card>
    );

    return (
        <Layout>
            <Toast message={toast} />

            <div className="-mx-4 -mt-6 bg-[#f8fafc] sm:-mx-6 lg:-mx-8">
                <div className="border-b border-slate-200/80 bg-white px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <Link href={businessPreview ? `/business/campaigns/${campaign.id}` : '/campaigns'} className="flex items-center gap-2 font-medium text-slate-600 transition hover:text-slate-950">
                                <span aria-hidden="true">&lsaquo;</span>
                                Back
                            </Link>
                            <span className="h-5 w-px bg-slate-200" />
                            <span className="text-slate-400">Marketplace</span>
                            <span className="text-slate-300">&rsaquo;</span>
                            <span className="font-bold text-slate-950">{campaign.title}</span>
                        </div>
                        {businessPreview && (
                            <CopyCampaignLinkButton url={campaign.participant_campaign_url} className="shrink-0" />
                        )}
                    </div>
                </div>

                <div className={`${mobileContentGutters} py-6 ${!businessPreview && campaign.referral_url ? 'pb-28 xl:pb-6' : ''}`}>
                    <Hero campaign={campaign} reward={reward} />

                    <div className="mt-4 space-y-4 xl:hidden">
                        {mobileReferralCard}
                        <Card className="p-4">
                            <RewardSummaryCard campaign={campaign} reward={reward} className="mt-0" />
                        </Card>
                        {statsGrid}
                        {mobileSharePanel}
                        {howItWorksCard}
                        {mobileCampaignInformation}
                        <CampaignTermsBlock terms={campaign.campaign_terms} />
                        {!businessPreview && payoutPromptCard}
                        {brandCard}
                        {!businessPreview && (
                            <button type="button" className="mx-auto flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-slate-600">
                                <span aria-hidden="true">!</span>
                                Report this campaign
                            </button>
                        )}
                    </div>

                    <div className="mt-6 hidden gap-6 xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] xl:items-start">
                        <div className="space-y-6">
                            {statsGrid}
                            {campaignInformation}
                            {howItWorksCard}
                        </div>

                        <aside className="space-y-4 overflow-hidden">
                            <Card className="overflow-hidden p-6 text-center">
                                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Campaign active
                                    {expiryLabel && (
                                        <>
                                            {' '}&middot; {expiryLabel}
                                        </>
                                    )}
                                </div>

                                <RewardSummaryCard campaign={campaign} reward={reward} />

                                <CampaignTermsBlock terms={campaign.campaign_terms} />

                                {!businessPreview && !campaign.referral_url && (
                                    <button
                                        type="button"
                                        onClick={generateLink}
                                        disabled={generating}
                                        className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-700 px-4 text-sm font-extrabold text-white shadow-sm transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {generating ? 'Generating...' : 'Join & Get My Link'}
                                    </button>
                                )}

                                {!businessPreview && campaign.referral_url && (
                                    <div className="mt-4 space-y-4">
                                        <CelebrationPanel campaignTitle={campaign.title} justJoined={justJoined} />
                                        {payoutPromptCard}
                                        {sharePanel}
                                    </div>
                                )}

                                <p className="mt-6 text-xs font-medium text-slate-400">
                                    {businessPreview ? 'Business preview - participant actions hidden' : 'Free to join - No minimums required'}
                                </p>
                            </Card>

                            {brandCard}

                            {!businessPreview && (
                                <button type="button" className="mx-auto flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-slate-600">
                                    <span aria-hidden="true">!</span>
                                    Report this campaign
                                </button>
                            )}
                        </aside>
                    </div>
                </div>
            </div>

            {!businessPreview && campaign.referral_url && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur xl:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                    <div className={`${mobileContentGutters} flex items-center gap-3`}>
                        <p className="min-w-0 flex-1 text-sm font-extrabold leading-5 text-slate-950">
                            Earn {reward} per referral
                        </p>
                        <button
                            type="button"
                            onClick={() => copyLink(fullReferralUrl)}
                            className="h-10 shrink-0 rounded-xl bg-slate-950 px-3 text-xs font-extrabold text-white transition hover:bg-slate-800"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                            type="button"
                            onClick={nativeShare}
                            className="h-10 shrink-0 rounded-xl border border-cyan-200 bg-cyan-50 px-3 text-xs font-extrabold text-cyan-700 transition hover:bg-cyan-100"
                        >
                            Share
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
}
