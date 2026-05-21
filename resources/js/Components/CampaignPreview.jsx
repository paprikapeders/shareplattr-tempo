import { useEffect, useMemo, useState } from 'react';
import Button from './Button';
import ImageWithFallback from './ImageWithFallback';
import { formatExpiryDate } from '../Support/dates';
import { formatReward } from '../Support/rewards';
import { CAMPAIGN_CATEGORY_OPTIONS, OTHER_KEY, optionLabel } from '../Support/taxonomy';

const genericCampaignTerms = 'Standard SharePlattr referral participation terms apply. Rewards are subject to verification, campaign availability, eligibility checks, and fraud review. Rewards may be rejected for self-referrals, duplicate activity, invalid conversions, or activity outside the campaign requirements.';

function rewardAmountForPreview(data) {
    const amount = Number.parseFloat(data.reward_amount);

    if (Number.isNaN(amount)) {
        return 0;
    }

    return Math.round(amount * 100);
}

function categoryLabel(data) {
    if (data.category_key === OTHER_KEY) {
        return data.category_other || 'Other';
    }

    return optionLabel(CAMPAIGN_CATEGORY_OPTIONS, data.category_key) || 'Campaign';
}

function rewardTypeLabel() {
    return 'Cash reward';
}

function rewardAmountLabel(campaign, reward) {
    if ((campaign.reward_type ?? 'flat') === 'percentage') {
        return `${reward} of verified conversion value`;
    }

    return `${reward} per verified referral`;
}

function Card({ children, className = '' }) {
    return (
        <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/5 ${className}`}>
            {children}
        </section>
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

function Pill({ children, className = '' }) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm backdrop-blur ${className}`}>
            {children}
        </span>
    );
}

function MetadataBlock({ title, children }) {
    if (!children) {
        return null;
    }

    return (
        <div>
            <h3 className="text-sm font-bold text-slate-950">{title}</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{children}</p>
        </div>
    );
}

function Hero({ campaign, reward }) {
    const expiryLabel = formatExpiryDate(campaign.expires_at, null);
    const statusLabel = campaign.status === 'draft' ? 'Draft preview' : 'Active';

    return (
        <section className="relative min-h-[255px] overflow-hidden rounded-none bg-slate-900 sm:rounded-2xl">
            {campaign.campaign_banner_url ? (
                <img
                    src={campaign.campaign_banner_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <ImageWithFallback
                    src={null}
                    alt=""
                    fallbackLabel={campaign.brand_name || campaign.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    initialsClassName="h-20 w-20 rounded-2xl text-3xl"
                />
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
                        {statusLabel}
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

function RewardSummaryCard({ campaign, reward }) {
    return (
        <div className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50/80 p-4 text-left shadow-sm shadow-cyan-900/5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-cyan-700">Reward</p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{rewardAmountLabel(campaign, reward)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                    {rewardTypeLabel(campaign)}
                </span>
            </div>

            <p className="mt-3 text-sm leading-5 text-slate-700">
                Paid after the referral completes the required action and the conversion is verified.
            </p>
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
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{campaignTerms}</p>
            </details>
        </div>
    );
}

export function CampaignPreviewContent({ data, brand }) {
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState(null);
    const previewCampaign = useMemo(() => ({
        id: 'preview',
        title: data.title || 'Untitled campaign',
        description: data.description || 'This campaign is ready for participants to review.',
        category: categoryLabel(data),
        brand_name: brand?.name || data.brand_name || 'SharePlattr brand',
        brand_logo_url: brand?.logo_url || data.brand_logo_url || null,
        brand_description: brand?.description || data.brand_description || null,
        brand_industry: brand?.business_type || data.brand_industry || null,
        campaign_banner_url: bannerPreviewUrl,
        reward_type: data.reward_type ?? 'flat',
        reward_amount: rewardAmountForPreview(data),
        destination_url: data.destination_url,
        share_message_template: data.share_message_template,
        campaign_terms: data.campaign_terms,
        commission_details: data.commission_details,
        cookie_duration: data.cookie_duration,
        network_platform: data.network_platform,
        payout_details: data.payout_details,
        requirements: data.requirements,
        deliverables: data.deliverables,
        participant_instructions: data.participant_instructions,
        expires_at: data.expires_at,
        status: data.status ?? 'draft',
    }), [bannerPreviewUrl, brand, data]);
    const reward = formatReward(previewCampaign);
    const expiryLabel = formatExpiryDate(previewCampaign.expires_at, null);
    const statusLabel = previewCampaign.status === 'draft' ? 'Campaign draft' : 'Campaign active';

    useEffect(() => {
        if (!data.campaign_banner) {
            setBannerPreviewUrl(data.campaign_banner_url ?? null);
            return undefined;
        }

        const nextUrl = URL.createObjectURL(data.campaign_banner);
        setBannerPreviewUrl(nextUrl);

        return () => URL.revokeObjectURL(nextUrl);
    }, [data.campaign_banner, data.campaign_banner_url]);

    return (
        <div className="bg-slate-50">
            <Hero campaign={previewCampaign} reward={reward} />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-950">About this campaign</h2>
                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{previewCampaign.description}</p>
                        {previewCampaign.destination_url && (
                            <p className="mt-5 break-all text-xs font-medium text-slate-400">
                                Destination: {previewCampaign.destination_url}
                            </p>
                        )}
                    </Card>

                    {previewCampaign.share_message_template && (
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-slate-950">Default share message</h2>
                            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{previewCampaign.share_message_template}</p>
                        </Card>
                    )}

                    {(previewCampaign.requirements || previewCampaign.deliverables || previewCampaign.participant_instructions || previewCampaign.payout_details) && (
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-slate-950">Campaign details</h2>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <MetadataBlock title="Requirements">{previewCampaign.requirements}</MetadataBlock>
                                <MetadataBlock title="Deliverables">{previewCampaign.deliverables}</MetadataBlock>
                                <MetadataBlock title="Participant Instructions">{previewCampaign.participant_instructions}</MetadataBlock>
                                <MetadataBlock title="Payout Details">{previewCampaign.payout_details}</MetadataBlock>
                            </div>
                        </Card>
                    )}
                </div>

                <aside className="space-y-4 overflow-hidden">
                    <Card className="overflow-hidden p-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {statusLabel}
                            {expiryLabel && (
                                <>
                                    {' '}&middot; {expiryLabel}
                                </>
                            )}
                        </div>

                        <RewardSummaryCard campaign={previewCampaign} reward={reward} />
                        <CampaignTermsBlock terms={previewCampaign.campaign_terms} />

                        <p className="mt-6 text-xs font-medium text-slate-400">
                            Business preview - participant actions hidden
                        </p>
                    </Card>

                    <Card className="p-5">
                        <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-400">About the brand</h2>
                        <div className="mt-4 flex items-center gap-4">
                            <BrandAvatar campaign={previewCampaign} className="h-12 w-12 shrink-0 rounded-xl text-sm" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-slate-950">{previewCampaign.brand_name ?? 'Brand'}</p>
                                <p className="mt-1 text-xs font-medium text-slate-400">{previewCampaign.category ?? previewCampaign.brand_industry ?? 'Campaign'}</p>
                            </div>
                        </div>

                        <p className="mt-4 border-b border-slate-100 pb-4 text-sm leading-6 text-slate-600">
                            {previewCampaign.brand_description ?? `${previewCampaign.brand_name ?? 'This brand'} is a trusted SharePlattr campaign partner.`}
                        </p>

                        {(previewCampaign.commission_details || previewCampaign.cookie_duration || previewCampaign.network_platform) && (
                            <dl className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
                                {previewCampaign.commission_details && (
                                    <div>
                                        <dt className="font-semibold text-slate-950">Commission</dt>
                                        <dd className="mt-1 text-slate-600">{previewCampaign.commission_details}</dd>
                                    </div>
                                )}
                                {previewCampaign.cookie_duration && (
                                    <div>
                                        <dt className="font-semibold text-slate-950">Cookie duration</dt>
                                        <dd className="mt-1 text-slate-600">{previewCampaign.cookie_duration}</dd>
                                    </div>
                                )}
                                {previewCampaign.network_platform && (
                                    <div>
                                        <dt className="font-semibold text-slate-950">Network</dt>
                                        <dd className="mt-1 text-slate-600">{previewCampaign.network_platform}</dd>
                                    </div>
                                )}
                            </dl>
                        )}

                        <p className="mt-4 border-t border-slate-100 pt-4 text-center text-xs font-semibold text-slate-400">
                            New to SharePlattr
                        </p>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

export default function CampaignPreviewModal({
    data,
    brand,
    isOpen,
    onClose,
    onConfirm,
    processing = false,
    confirmLabel,
}) {
    const resolvedConfirmLabel = confirmLabel
        ?? (data.status === 'draft' ? 'Create Draft' : 'Publish Campaign');

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === 'Escape' && !processing) {
                onClose();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose, processing]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 px-3 py-4 backdrop-blur-sm sm:px-6">
            <div className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center">
                <section className="w-full overflow-hidden rounded-2xl bg-slate-50 shadow-2xl shadow-slate-950/30">
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-950">Preview Campaign</h2>
                            <p className="mt-1 text-sm text-slate-500">Review the participant view before creating this campaign.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-lg border border-slate-200 bg-white text-xl font-semibold leading-none text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                            aria-label="Close preview"
                        >
                            x
                        </button>
                    </div>

                    <div className="max-h-[calc(100vh-11rem)] overflow-y-auto p-0 sm:p-5">
                        <CampaignPreviewContent data={data} brand={brand} />
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={processing}>
                            Edit Details
                        </Button>
                        <Button type="button" onClick={onConfirm} disabled={processing}>
                            {processing ? 'Saving...' : resolvedConfirmLabel}
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
