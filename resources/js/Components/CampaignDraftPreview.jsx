import { useEffect, useMemo, useState } from 'react';
import Button from './Button';
import Card from './Card';
import { formatReward } from '../Support/rewards';
import { CAMPAIGN_CATEGORY_OPTIONS, OTHER_KEY, optionLabel } from '../Support/taxonomy';

function initials(name = '') {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'S';
}

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

export default function CampaignDraftPreview({
    data,
    brand,
    onEdit,
    onConfirm,
    processing = false,
    confirmLabel = 'Looks good, create campaign',
}) {
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState(null);
    const previewCampaign = useMemo(() => ({
        title: data.title || 'Untitled campaign',
        description: data.description || 'This campaign is ready for participants to review.',
        category: categoryLabel(data),
        brand_name: brand?.name || 'SharePlattr brand',
        brand_logo_url: brand?.logo_url || null,
        campaign_banner_url: bannerPreviewUrl,
        reward_type: data.reward_type ?? 'flat',
        reward_amount: rewardAmountForPreview(data),
        destination_url: data.destination_url,
        expires_at: data.expires_at,
        status: data.status ?? 'draft',
    }), [bannerPreviewUrl, brand, data]);
    const reward = formatReward(previewCampaign);
    const statusCopy = previewCampaign.status === 'active'
        ? 'Ready to launch'
        : `${previewCampaign.status} - not publicly visible yet`;

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
        <div className="space-y-5">
            <Card className="max-w-5xl overflow-hidden">
                <div className="border-b border-slate-200 bg-white px-6 py-5">
                    <p className="text-sm font-semibold text-slate-500">
                        This is how participants will see your campaign. Review the details before publishing.
                    </p>
                </div>

                <div className="bg-slate-50 p-4 sm:p-6">
                    <section className="relative min-h-[255px] overflow-hidden rounded-2xl bg-slate-900">
                        {previewCampaign.campaign_banner_url ? (
                            <img src={previewCampaign.campaign_banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#0e7490_48%,#7c3aed_100%)]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/38 to-black/12" />

                        <div className="relative flex min-h-[255px] flex-col justify-end gap-5 p-5 text-white sm:p-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex min-w-0 items-end gap-4">
                                {previewCampaign.brand_logo_url ? (
                                    <img src={previewCampaign.brand_logo_url} alt="" className="h-14 w-14 shrink-0 rounded-2xl bg-white object-cover text-lg shadow-xl ring-1 ring-white/70 sm:h-16 sm:w-16" />
                                ) : (
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-[#08bcbc] shadow-xl ring-1 ring-white/70 sm:h-16 sm:w-16">
                                        {initials(previewCampaign.brand_name || previewCampaign.title)}
                                    </div>
                                )}
                                <div className="min-w-0 pb-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-[#08bcbc]/90 px-3 py-1 text-xs font-bold text-white">
                                            {previewCampaign.category}
                                        </span>
                                        <span className="text-xs font-semibold text-white/85">by {previewCampaign.brand_name}</span>
                                    </div>
                                    <h1 className="mt-2 line-clamp-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                        {previewCampaign.title}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 lg:justify-end">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2 text-xs font-bold text-white shadow-sm ring-1 ring-white/25 backdrop-blur">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    {statusCopy}
                                </span>
                                <span className="inline-flex rounded-full bg-white/18 px-4 py-2 text-xs font-bold text-white shadow-sm ring-1 ring-white/25 backdrop-blur">
                                    {reward} / conversion
                                </span>
                            </div>
                        </div>
                    </section>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/5">
                            <h2 className="text-lg font-bold text-slate-950">About this campaign</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700">{previewCampaign.description}</p>
                            {previewCampaign.destination_url && (
                                <p className="mt-5 break-all text-xs font-medium text-slate-400">
                                    Destination: {previewCampaign.destination_url}
                                </p>
                            )}
                        </div>

                        <aside className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm shadow-slate-950/5">
                            <p className="text-sm font-semibold text-slate-500">{statusCopy}</p>
                            <p className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950">{reward}</p>
                            <p className="mt-2 text-sm text-slate-400">earned per verified conversion</p>
                            {previewCampaign.expires_at && (
                                <p className="mt-5 text-xs font-medium text-slate-400">
                                    Expires {previewCampaign.expires_at}
                                </p>
                            )}
                        </aside>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                <Button type="button" variant="secondary" onClick={onEdit}>
                    Edit details
                </Button>
                <Button type="button" onClick={onConfirm} disabled={processing}>
                    {processing ? 'Creating...' : confirmLabel}
                </Button>
            </div>
        </div>
    );
}
