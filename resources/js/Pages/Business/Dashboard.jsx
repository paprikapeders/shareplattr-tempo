import { Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import BusinessSetupChecklist from '../../Components/BusinessSetupChecklist';
import ConversionLabel, { CONVERSION_HELP_TEXT } from '../../Components/ConversionLabel';
import Tooltip from '../../Components/Tooltip';
import BusinessLayout from '../../Layouts/BusinessLayout';
import { formatReward } from '../../Support/rewards';

function dollars(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100);
}

function statusClass(status) {
    if (status === 'active') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'paused') {
        return 'bg-amber-50 text-amber-700';
    }

    return 'bg-slate-100 text-slate-500';
}

function statusLabel(status) {
    if (status === 'active') {
        return 'Active';
    }

    if (status === 'paused') {
        return 'Paused';
    }

    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Inactive';
}

function progressColor(index) {
    return ['bg-cyan-400', 'bg-cyan-500', 'bg-yellow-400', 'bg-slate-300'][index % 4];
}

function shortUrl(value) {
    if (!value) {
        return 'No destination';
    }

    try {
        const url = new URL(value);
        return `${url.hostname}${url.pathname === '/' ? '' : url.pathname}`;
    } catch {
        return value;
    }
}

function iconColor(index) {
    return ['bg-violet-100 text-violet-700', 'bg-cyan-100 text-cyan-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'][index % 4];
}

function CampaignThumb({ campaign, index }) {
    if (campaign.banner_url) {
        return <img src={campaign.banner_url} alt="" className="h-10 w-10 rounded-lg object-cover" />;
    }

    return (
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold ${iconColor(index)}`}>
            {campaign.title?.slice(0, 2).toUpperCase() || 'SP'}
        </div>
    );
}

function CampaignRow({ campaign, index, maxClicks }) {
    const progress = campaign.conversions > 0
        ? Math.min(100, Math.max(5, Math.round(campaign.conversion_rate)))
        : (maxClicks > 0 ? Math.max(5, Math.round((campaign.clicks / maxClicks) * 100)) : 0);
    const nextStatus = campaign.status === 'active' ? 'paused' : 'active';
    const canToggleStatus = ['active', 'paused'].includes(campaign.status);

    function updateStatus(event) {
        event.preventDefault();
        event.stopPropagation();

        router.patch(`/business/campaigns/${campaign.id}/status`, {
            status: nextStatus,
        }, {
            preserveScroll: true,
        });
    }

    return (
        <div className="group relative grid min-h-[76px] grid-cols-[40px_minmax(0,1fr)_56px_56px_64px_92px_78px_80px] items-center gap-3 border-b border-slate-100 px-5 py-2.5 transition hover:bg-slate-50 last:border-b-0 xl:grid-cols-[40px_minmax(0,1fr)_62px_62px_64px_104px_82px_84px]">
            <Link
                href={`/business/campaigns/${campaign.id}`}
                className="absolute inset-0 z-10"
                aria-label={`View ${campaign.title}`}
            />
            <CampaignThumb campaign={campaign} index={index} />

            <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-950 transition group-hover:text-cyan-700">{campaign.title}</p>
                    <span className="hidden text-xs text-slate-400 sm:inline">{campaign.brand_name || 'Business'}</span>
                    <span className="hidden text-xs text-slate-400 md:inline">- {campaign.category || 'Uncategorized'}</span>
                    <span className="hidden text-xs text-slate-400 lg:inline">- Created {campaign.created_at}</span>
                    {campaign.expires_at && <span className="hidden text-xs text-slate-400 xl:inline">- Expires {campaign.expires_at}</span>}
                </div>
                <p className="mt-1 truncate text-[11px] text-slate-400">{shortUrl(campaign.destination_url)} - Reward {formatReward(campaign)}</p>
                <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${progressColor(index)}`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className="hidden w-14 text-right text-[10px] font-medium text-slate-400 lg:inline">{campaign.conversions > 0 ? `${campaign.conversion_rate}% CVR` : `${campaign.clicks} clicks`}</span>
                </div>
            </div>

            <div className="text-center">
                <p className="text-sm font-bold text-slate-950">{campaign.clicks}</p>
                <p className="text-[10px] text-slate-400">Clicks</p>
            </div>
            <div className="text-center">
                <p className="text-sm font-bold text-slate-950">{campaign.unique_clicks}</p>
                <p className="text-[10px] text-slate-400">Unique</p>
                <p className="text-[10px] text-slate-400">{campaign.flagged_clicks} flagged</p>
            </div>
            <div className="text-center">
                <p className="text-sm font-bold text-slate-950">{campaign.conversions}</p>
                <p className="text-[10px] text-slate-400">Conv.</p>
            </div>
            <div className="text-center">
                <p className="text-sm font-bold text-violet-600">{dollars(campaign.rewards_generated)}</p>
                <p className="text-[10px] text-slate-400">Generated</p>
            </div>
            <div className="text-right">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(campaign.status)}`}>
                    {statusLabel(campaign.status)}
                </span>
            </div>
            <div className="relative z-20 flex justify-end">
                {canToggleStatus && (
                    <button
                        type="button"
                        onClick={updateStatus}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
                    >
                        {campaign.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                )}
            </div>
        </div>
    );
}

function SummaryMetric({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
        </div>
    );
}

function PillTab({ active, children, onClick, tooltip }) {
    return (
        <span className="inline-flex items-center gap-1">
            <button
                type="button"
                onClick={onClick}
                className={`rounded-full border px-5 py-2 text-xs font-bold uppercase transition ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
                {children}
            </button>
            {tooltip && <Tooltip label={`${children} definition`}>{tooltip}</Tooltip>}
        </span>
    );
}

function Actions({ campaign }) {
    return (
        <div className="flex justify-end gap-2 text-slate-500">
            <Link
                href={`/business/campaigns/${campaign.id}/edit`}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-semibold transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                aria-label="Edit campaign"
                title="Edit campaign"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M12 20h9" /><path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z" /></svg>
                <span className="hidden xl:inline">Edit</span>
            </Link>
            <Link
                href={`/business/campaigns/${campaign.id}`}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-semibold transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                aria-label="View campaign"
                title="View campaign"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                <span className="hidden xl:inline">View</span>
            </Link>
            <Link
                href={`/business/campaigns/${campaign.id}/stats`}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-semibold transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                aria-label="View campaign stats"
                title="View campaign stats"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M4 19V5M9 19v-8M14 19V8M19 19v-5" /></svg>
                <span className="hidden xl:inline">Stats</span>
            </Link>
        </div>
    );
}

export default function Dashboard({ stats, campaignPerformance, conversions, payoutLiabilities, setupChecklist }) {
    const [activeTab, setActiveTab] = useState('campaigns');
    const maxClicks = useMemo(
        () => Math.max(...campaignPerformance.map((campaign) => campaign.clicks), 0),
        [campaignPerformance],
    );

    return (
        <BusinessLayout>
            <div className="mx-auto w-full max-w-screen-xl space-y-6">
                <BusinessSetupChecklist checklist={setupChecklist} />

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-5 sm:p-6">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-9">
                            <SummaryMetric label="Total Campaigns" value={stats.total_campaigns} />
                            <SummaryMetric label="Active" value={stats.active_campaigns} />
                            <SummaryMetric label="Clicks" value={stats.total_clicks} />
                            <SummaryMetric label="Unique" value={stats.unique_clicks} />
                            <SummaryMetric label={<ConversionLabel>Conversions</ConversionLabel>} value={stats.total_conversions} />
                            <SummaryMetric label="Avg CVR" value={`${stats.average_conversion_rate}%`} />
                            <SummaryMetric label="Generated" value={dollars(stats.rewards_generated)} />
                            <SummaryMetric label="Pending" value={dollars(stats.pending_payout_liability)} />
                            <SummaryMetric label="Paid" value={dollars(stats.paid_rewards)} />
                        </div>
                    </div>

                    <div>
                        {campaignPerformance.length > 0 ? (
                            campaignPerformance.slice(0, 5).map((campaign, index) => (
                                <CampaignRow key={campaign.id} campaign={campaign} index={index} maxClicks={maxClicks} />
                            ))
                        ) : (
                            <div className="px-5 py-10 text-center">
                                <p className="text-sm font-semibold text-slate-950">You have not created any campaigns yet.</p>
                                <Link href="/business/campaigns/create" className="mt-3 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                                    Create your first campaign
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 px-5 py-4 text-center">
                        <Link href="/business/campaigns" className="text-sm font-semibold text-cyan-600">
                            View all campaigns
                        </Link>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <PillTab active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')}>Campaigns</PillTab>
                        <PillTab active={activeTab === 'conversions'} onClick={() => setActiveTab('conversions')} tooltip={CONVERSION_HELP_TEXT}>Conversions</PillTab>
                        <PillTab active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')}>Payout Liability</PillTab>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-5">
                            <h2 className="text-sm font-bold text-slate-950">
                                {activeTab === 'campaigns' && 'Campaigns'}
                                {activeTab === 'conversions' && <ConversionLabel>Campaign Conversions</ConversionLabel>}
                                {activeTab === 'payouts' && 'Payout Liability'}
                            </h2>
                        </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                        <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none">
                            <option>10</option>
                            <option>25</option>
                        </select>
                        <div className="flex gap-3">
                            <input type="search" placeholder="Search" className="h-9 w-40 rounded-lg border border-slate-200 px-3 text-sm outline-none sm:w-56" />
                            <button type="button" className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600">Export</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {activeTab === 'campaigns' && (
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr className="bg-white text-left text-[11px] font-bold uppercase text-slate-400">
                                        <th className="px-5 py-3">Campaign</th>
                                        <th className="px-5 py-3 text-right">Clicks</th>
                                        <th className="px-5 py-3 text-right">Unique</th>
                                        <th className="px-5 py-3 text-right">
                                            <ConversionLabel className="justify-end">Conversions</ConversionLabel>
                                        </th>
                                        <th className="px-5 py-3 text-right">CVR</th>
                                        <th className="px-5 py-3 text-right">Reward</th>
                                        <th className="px-5 py-3 text-right">Total Generated</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {campaignPerformance.map((campaign, index) => (
                                        <tr key={campaign.id} className="text-sm">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <CampaignThumb campaign={campaign} index={index} />
                                                    <span className="font-semibold text-slate-950">{campaign.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right text-slate-700">{campaign.clicks}</td>
                                            <td className="px-5 py-4 text-right text-slate-700">{campaign.unique_clicks}</td>
                                            <td className="px-5 py-4 text-right text-slate-700">{campaign.conversions}</td>
                                            <td className="px-5 py-4 text-right text-slate-700">{campaign.conversion_rate}%</td>
                                            <td className="px-5 py-4 text-right text-slate-700">{formatReward(campaign)}</td>
                                            <td className="px-5 py-4 text-right font-medium text-slate-700">{dollars(campaign.rewards_generated)}</td>
                                            <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(campaign.status)}`}>{statusLabel(campaign.status)}</span></td>
                                            <td className="px-5 py-4"><Actions campaign={campaign} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'conversions' && (
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr className="text-left text-[11px] font-bold uppercase text-slate-400">
                                        <th className="px-5 py-3">Campaign</th>
                                        <th className="px-5 py-3">Referrer</th>
                                        <th className="px-5 py-3 text-right">Amount</th>
                                        <th className="px-5 py-3">Reward</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {conversions.map((conversion) => (
                                        <tr key={conversion.id} className="text-sm">
                                            <td className="px-5 py-4 font-semibold text-slate-950">{conversion.campaign_title}</td>
                                            <td className="px-5 py-4 text-slate-600">{conversion.participant_name || conversion.participant_email || 'Unknown'}</td>
                                            <td className="px-5 py-4 text-right text-slate-700">{dollars(conversion.amount)}</td>
                                            <td className="px-5 py-4 text-slate-600">{conversion.reward_created ? dollars(conversion.reward_amount) : 'No reward'}</td>
                                            <td className="px-5 py-4 text-slate-600">{conversion.status}</td>
                                            <td className="px-5 py-4 text-right text-slate-500">{conversion.created_at}</td>
                                        </tr>
                                    ))}
                                    {conversions.length === 0 && <tr><td className="px-5 py-6 text-sm text-slate-500" colSpan="6">No conversions yet.</td></tr>}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'payouts' && (
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr className="text-left text-[11px] font-bold uppercase text-slate-400">
                                        <th className="px-5 py-3">Campaign</th>
                                        <th className="px-5 py-3">Referrer</th>
                                        <th className="px-5 py-3 text-right">Payout</th>
                                        <th className="px-5 py-3 text-right">Paid</th>
                                        <th className="px-5 py-3 text-right">Total Rewards</th>
                                        <th className="px-5 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payoutLiabilities.map((reward) => (
                                        <tr key={reward.id} className="text-sm">
                                            <td className="px-5 py-4 font-semibold text-slate-950">{reward.campaign_title}</td>
                                            <td className="px-5 py-4 text-slate-600">{reward.participant_name || reward.participant_email || 'Unknown'}</td>
                                            <td className="px-5 py-4 text-right text-slate-700">{dollars(reward.pending_amount)}</td>
                                            <td className="px-5 py-4 text-right text-slate-700">{dollars(reward.paid_amount)}</td>
                                            <td className="px-5 py-4 text-right text-slate-700">{dollars(reward.total_amount)}</td>
                                            <td className="px-5 py-4 text-right text-slate-600">{reward.status}</td>
                                        </tr>
                                    ))}
                                    {payoutLiabilities.length === 0 && <tr><td className="px-5 py-6 text-sm text-slate-500" colSpan="5">No payout liability yet.</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                    </div>
                </section>
            </div>
        </BusinessLayout>
    );
}
