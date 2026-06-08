import { Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import ConversionLabel from '../../../Components/ConversionLabel';
import Tooltip from '../../../Components/Tooltip';
import { formatDisplayDate, formatExpiryDate } from '../../../Support/dates';
import { formatReward } from '../../../Support/rewards';
import usePollingStats from '../../../Support/usePollingStats';

function statusClass(status) {
    if (status === 'active') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/10';
    }

    if (status === 'paused') {
        return 'bg-amber-50 text-amber-700 ring-amber-600/10';
    }

    return 'bg-slate-100 text-slate-600 ring-slate-500/10';
}

function statusLabel(status) {
    if (!status) {
        return 'Inactive';
    }

    return status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(status)}`}>
            {statusLabel(status)}
        </span>
    );
}

function MetaItem({ children }) {
    if (!children) {
        return null;
    }

    return <span className="min-w-0 truncate">{children}</span>;
}

function MetricCard({ label, value, children }) {
    return (
        <Card className="p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
                {label === 'Conversions' ? <ConversionLabel>{label}</ConversionLabel> : label}
            </p>
            <div className="mt-2 text-2xl font-bold text-slate-950">{children ?? value}</div>
        </Card>
    );
}

function dollars(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100);
}

function RecentCard({ title, children, empty }) {
    return (
        <Card className="p-0">
            <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">
                    {title === 'Recent Conversions' ? <ConversionLabel>{title}</ConversionLabel> : title}
                </h2>
            </div>
            {empty ? (
                <div className="px-5 py-8 text-sm text-slate-500">{empty}</div>
            ) : (
                <div className="overflow-x-auto px-5">
                    {children}
                </div>
            )}
        </Card>
    );
}

function DetailItem({ label, children, wide = false }) {
    return (
        <div className={wide ? 'sm:col-span-2' : ''}>
            <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm leading-6 text-slate-700">{children}</dd>
        </div>
    );
}

function ChannelStats({ sources = [] }) {
    const maxClicks = Math.max(0, ...sources.map((source) => Number(source.clicks) || 0));

    return (
        <Card className="p-0">
            <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">Clicks by Channel</h2>
            </div>

            <div className="space-y-4 px-5 py-5">
                {sources.map((source) => (
                    <div key={source.source} className="grid gap-2 text-sm sm:grid-cols-[150px_minmax(0,1fr)_56px] sm:items-center">
                        <span className="font-medium text-slate-700">{source.source === 'direct' ? 'Direct / Unknown' : source.label}</span>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-[#08c4c4] transition-[width] duration-300"
                                style={{ width: maxClicks > 0 ? `${Math.round(((Number(source.clicks) || 0) / maxClicks) * 100)}%` : '0%' }}
                            />
                        </div>
                        <span className="text-right font-bold text-slate-950">{source.clicks}</span>
                    </div>
                ))}

                <p className="flex items-center gap-1.5 border-t border-slate-100 pt-4 text-xs font-medium text-slate-400">
                    <span>Channel attribution is estimated</span>
                    <Tooltip label="Explain channel attribution">
                        SharePlattr appends UTM parameters to participant links when possible. Channel attribution is estimated from those UTM values and referral click data, so it may not be exact.
                    </Tooltip>
                </p>
            </div>
        </Card>
    );
}

function LocationStats({ locations = [] }) {
    const rows = locations.length > 0
        ? locations
        : [{ label: 'Unknown', clicks: 0, unique_clicks: 0 }];
    const maxClicks = Math.max(0, ...rows.map((location) => Number(location.clicks) || 0));

    return (
        <Card className="p-0">
            <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">Clicks by Location</h2>
            </div>

            <div className="space-y-4 px-5 py-5">
                {rows.map((location) => (
                    <div key={`${location.label}-${location.country_code ?? 'unknown'}`} className="grid gap-2 text-sm sm:grid-cols-[180px_minmax(0,1fr)_96px] sm:items-center">
                        <span className="font-medium text-slate-700">{location.label}</span>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-[#08c4c4] transition-[width] duration-300"
                                style={{ width: maxClicks > 0 ? `${Math.round(((Number(location.clicks) || 0) / maxClicks) * 100)}%` : '0%' }}
                            />
                        </div>
                        <span className="text-right font-bold text-slate-950">
                            {location.clicks}
                            <span className="ml-1 font-medium text-slate-400">/ {location.unique_clicks} unique</span>
                        </span>
                    </div>
                ))}

                <p className="border-t border-slate-100 pt-4 text-xs font-medium text-slate-400">
                    Location is estimated from referral click IPs and grouped by country/state.
                </p>
            </div>
        </Card>
    );
}

function ParticipantsModal({ open, participants = [], onClose }) {
    const [query, setQuery] = useState('');
    const filteredParticipants = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return participants;
        }

        return participants.filter((participant) => [
            participant.participant_name,
            participant.participant_email,
        ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery)));
    }, [participants, query]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
            <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">Joined Users</h2>
                        <p className="mt-1 text-sm text-slate-500">Participants who generated a referral link for this campaign.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>

                <div className="border-b border-slate-100 px-5 py-4">
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search name or email"
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 sm:max-w-sm"
                    />
                </div>

                <div className="overflow-auto">
                    <table className="w-full min-w-[920px] divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Participant</th>
                                <th className="px-5 py-3">Joined</th>
                                <th className="px-5 py-3 text-right">Clicks</th>
                                <th className="px-5 py-3 text-right">Unique</th>
                                <th className="px-5 py-3 text-right">Conversions</th>
                                <th className="px-5 py-3 text-right">Rewards</th>
                                <th className="px-5 py-3 text-right">Latest Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredParticipants.map((participant) => (
                                <tr key={participant.id}>
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-950">{participant.participant_name}</div>
                                        <div className="mt-0.5 text-xs text-slate-500">{participant.participant_email}</div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{formatDisplayDate(participant.joined_at, 'Unknown')}</td>
                                    <td className="px-5 py-4 text-right font-semibold text-slate-950">{participant.total_clicks}</td>
                                    <td className="px-5 py-4 text-right text-slate-700">{participant.unique_clicks}</td>
                                    <td className="px-5 py-4 text-right text-slate-700">{participant.conversions}</td>
                                    <td className="px-5 py-4 text-right text-slate-700">{dollars(participant.rewards_generated)}</td>
                                    <td className="px-5 py-4 text-right text-slate-500">{formatDisplayDate(participant.latest_activity_at, 'None')}</td>
                                </tr>
                            ))}
                            {filteredParticipants.length === 0 && (
                                <tr>
                                    <td className="px-5 py-8 text-sm text-slate-500" colSpan="7">No participants match your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function PayoutRequestsModal({ open, payoutRequests = [], onClose }) {
    const [query, setQuery] = useState('');
    const filteredPayoutRequests = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return payoutRequests;
        }

        return payoutRequests.filter((payoutRequest) => [
            payoutRequest.participant?.name,
            payoutRequest.participant?.email,
        ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery)));
    }, [payoutRequests, query]);
    const emptyMessage = payoutRequests.length === 0
        ? 'No payout requests for this campaign yet.'
        : 'No payout requests match your search.';

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
            <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">Payout Requests</h2>
                        <p className="mt-1 text-sm text-slate-500">Valid payout requests for this campaign.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button as={Link} href="/business/payout-requests" variant="secondary">Manage payout requests</Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="border-b border-slate-100 px-5 py-4">
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search name or email"
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 sm:max-w-sm"
                    />
                </div>

                <div className="overflow-auto">
                    <table className="w-full min-w-[1080px] divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Participant</th>
                                <th className="px-5 py-3">Requested</th>
                                <th className="px-5 py-3 text-right">Rewards</th>
                                <th className="px-5 py-3 text-right">Amount</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Payout Method</th>
                                <th className="px-5 py-3 text-right">Latest Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPayoutRequests.map((payoutRequest) => (
                                <tr key={payoutRequest.id}>
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-950">{payoutRequest.participant?.name ?? 'Participant'}</div>
                                        <div className="mt-0.5 text-xs text-slate-500">{payoutRequest.participant?.email ?? 'No email'}</div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{formatDisplayDate(payoutRequest.requested_at, 'Unknown')}</td>
                                    <td className="px-5 py-4 text-right font-semibold text-slate-950">{payoutRequest.rewards_count}</td>
                                    <td className="px-5 py-4 text-right font-semibold text-slate-950">{dollars(payoutRequest.campaign_amount)}</td>
                                    <td className="px-5 py-4"><StatusBadge status={payoutRequest.status} /></td>
                                    <td className="px-5 py-4 text-slate-600">{payoutRequest.payout_method ?? 'Not provided'}</td>
                                    <td className="px-5 py-4 text-right text-slate-500">{formatDisplayDate(payoutRequest.latest_update_at, 'None')}</td>
                                </tr>
                            ))}
                            {filteredPayoutRequests.length === 0 && (
                                <tr>
                                    <td className="px-5 py-8 text-sm text-slate-500" colSpan="7">{emptyMessage}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ConversionApprovalQueue({ conversions = [] }) {
    return (
        <Card className="p-0">
            <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">Conversion Approval Queue</h2>
            </div>

            {conversions.length === 0 ? (
                <div className="px-5 py-8">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5">
                        <p className="max-w-2xl text-sm leading-6 text-slate-600">
                            When a participant achieves a conversion, it will appear here for your review. Approve to release payment, or reject if the conversion is invalid.
                        </p>
                        <button
                            type="button"
                            className="mt-3 text-sm font-semibold text-cyan-700 transition hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                            aria-label="Learn more about conversions"
                        >
                            Learn more about conversions
                        </button>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Participant</th>
                                <th className="px-5 py-3">Campaign</th>
                                <th className="px-5 py-3">Amount / Reward</th>
                                <th className="px-5 py-3">Created</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {conversions.map((conversion) => (
                                <tr key={conversion.id}>
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-950">{conversion.participant_name}</div>
                                        {conversion.participant_email && (
                                            <div className="mt-0.5 text-xs text-slate-500">{conversion.participant_email}</div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-slate-700">{conversion.campaign}</td>
                                    <td className="px-5 py-4 text-slate-700">
                                        <div className="font-semibold text-slate-950">{conversion.amount_display}</div>
                                        <div className="mt-0.5 text-xs text-slate-500">Reward {conversion.reward_display}</div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{conversion.created_at}</td>
                                    <td className="px-5 py-4">
                                        <StatusBadge status={conversion.status} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" disabled variant="secondary">Approve</Button>
                                            <Button type="button" disabled variant="secondary">Reject</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}

export default function Show({ campaign }) {
    const [participantsOpen, setParticipantsOpen] = useState(false);
    const [payoutRequestsOpen, setPayoutRequestsOpen] = useState(false);
    const { stats: liveSummary, lastUpdatedAt } = usePollingStats(`/business/campaigns/${campaign.id}/stats-summary`, {
        stats: campaign.stats,
        recentClicks: campaign.recentClicks,
        recentConversions: campaign.recentConversions,
        campaign: {
            click_count: campaign.click_count,
            conversion_count: campaign.conversion_count,
            source_breakdown: campaign.source_breakdown,
            location_breakdown: campaign.location_breakdown,
        },
    });
    const canToggleStatus = ['active', 'paused'].includes(campaign.status);
    const nextStatus = campaign.status === 'active' ? 'paused' : 'active';
    const simulateForm = useForm({
        referral_token_id: campaign.referral_tokens?.length === 1 ? campaign.referral_tokens[0].id : '',
    });

    function updateStatus() {
        router.patch(`/business/campaigns/${campaign.id}/status`, {
            status: nextStatus,
        }, {
            preserveScroll: true,
        });
    }

    function simulateConversion(event) {
        event.preventDefault();

        simulateForm.post(`/business/campaigns/${campaign.id}/simulate-conversion`, {
            preserveScroll: true,
        });
    }

    const liveCampaign = liveSummary?.campaign ?? {};
    const liveStats = liveSummary?.stats ?? campaign.stats ?? {};
    const recentClicks = liveSummary?.recentClicks ?? campaign.recentClicks ?? [];
    const recentConversions = liveSummary?.recentConversions ?? campaign.recentConversions ?? [];
    const sourceBreakdown = liveSummary?.source_breakdown ?? liveCampaign.source_breakdown ?? campaign.source_breakdown;
    const locationBreakdown = liveSummary?.location_breakdown ?? liveCampaign.location_breakdown ?? campaign.location_breakdown ?? [];
    const pendingConversions = liveCampaign.pending_conversions ?? campaign.pending_conversions ?? [];
    const participants = campaign.participants ?? [];
    const payoutRequests = campaign.payout_requests ?? [];

    return (
        <BusinessLayout>
            <div className="mx-auto max-w-6xl space-y-5">
                <section className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase text-slate-500">Business Campaign</p>
                        <h1 className="mt-1 break-words text-2xl font-bold text-slate-950 sm:text-3xl">{campaign.title}</h1>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                            <MetaItem>{campaign.brand_name || 'Business'}</MetaItem>
                            <MetaItem>{campaign.category}</MetaItem>
                            <MetaItem>{campaign.created_at ? `Created ${campaign.created_at}` : null}</MetaItem>
                            <MetaItem>{formatExpiryDate(campaign.expires_at, 'No expiry')}</MetaItem>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button as={Link} href={`/business/campaigns/${campaign.id}/edit`} variant="secondary">Edit</Button>
                        <Button as={Link} href={campaign.business_preview_url ?? `/business/campaigns/${campaign.id}/preview`} variant="secondary">View Campaign</Button>
                        <Button type="button" onClick={() => setParticipantsOpen(true)} variant="secondary">View Participants</Button>
                        <Button type="button" onClick={() => setPayoutRequestsOpen(true)} variant="secondary">View Payout Requests</Button>
                        {canToggleStatus && (
                            <Button type="button" onClick={updateStatus} variant="secondary">
                                {campaign.status === 'active' ? 'Pause' : 'Resume'}
                            </Button>
                        )}
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard label="Status"><StatusBadge status={campaign.status} /></MetricCard>
                    <MetricCard label="Reward" value={formatReward(campaign)} />
                    <MetricCard label="Total Clicks" value={liveStats.total_clicks ?? liveCampaign.click_count ?? campaign.click_count ?? 0} />
                    <MetricCard label="Unique Clicks" value={liveStats.unique_clicks ?? 0} />
                    <MetricCard label="Flagged Clicks" value={liveStats.flagged_clicks ?? 0} />
                    <MetricCard label="Conversions" value={liveStats.conversions ?? liveCampaign.conversion_count ?? campaign.conversion_count ?? 0} />
                    <MetricCard label="Conversion Rate" value={`${liveStats.conversion_rate ?? 0}%`} />
                    <MetricCard label="Rewards Generated" value={dollars(liveStats.total_rewards_generated)} />
                </div>
                {lastUpdatedAt && (
                    <p className="-mt-3 text-xs font-medium text-slate-400">
                        Last updated {lastUpdatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                    </p>
                )}

                <div className="grid gap-5 lg:grid-cols-2">
                    <ChannelStats sources={sourceBreakdown} />
                    <LocationStats locations={locationBreakdown} />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <RecentCard title="Recent Clicks" empty={recentClicks.length === 0 ? 'No clicks yet.' : null}>
                        <table className="w-full min-w-[520px] table-auto divide-y divide-slate-100">
                            <tbody className="divide-y divide-slate-100">
                                {recentClicks.map((click) => (
                                    <tr key={click.id}>
                                        <td className="py-4 pr-3 text-sm text-slate-600">{click.location_label ?? 'Unknown'}</td>
                                        <td className="px-3 py-4 text-sm text-slate-600">{click.source === 'direct' ? 'Direct / Unknown' : click.source}</td>
                                        <td className="px-3 py-4 text-sm text-slate-600">{click.is_flagged ? click.flag_reason || 'flagged' : 'unique'}</td>
                                        <td className="py-4 pl-3 text-right text-sm text-slate-500">{click.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </RecentCard>

                    <RecentCard title="Recent Conversions" empty={recentConversions.length === 0 ? 'No conversions yet.' : null}>
                        <table className="w-full min-w-[520px] table-auto divide-y divide-slate-100">
                            <tbody className="divide-y divide-slate-100">
                                {recentConversions.map((conversion) => (
                                    <tr key={conversion.id}>
                                        <td className="py-4 pr-3 text-sm font-semibold text-slate-950">{dollars(conversion.amount)}</td>
                                        <td className="px-3 py-4 text-sm text-slate-600">{conversion.status}</td>
                                        <td className="py-4 pl-3 text-right text-sm text-slate-500">{conversion.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </RecentCard>
                </div>

                <ConversionApprovalQueue conversions={pendingConversions} />

                {campaign.can_simulate_conversion && (
                    <Card>
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div className="min-w-0">
                                <h2 className="text-sm font-bold text-slate-950">Simulate Conversion</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Creates a verified conversion and pending reward for MVP testing. Payout still requires participant request.
                                </p>
                            </div>

                            <form onSubmit={simulateConversion} className="flex flex-col gap-3 sm:min-w-80">
                                {campaign.referral_tokens?.length > 1 && (
                                    <select
                                        value={simulateForm.data.referral_token_id}
                                        onChange={(event) => simulateForm.setData('referral_token_id', event.target.value)}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm shadow-slate-950/5"
                                    >
                                        <option value="">Select referral owner</option>
                                        {campaign.referral_tokens.map((token) => (
                                            <option key={token.id} value={token.id}>
                                                {token.user_name} ({token.user_email})
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {simulateForm.errors.referral_token_id && (
                                    <p className="text-sm text-rose-600">{simulateForm.errors.referral_token_id}</p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={simulateForm.processing || campaign.referral_tokens?.length === 0}
                                >
                                    {simulateForm.processing ? 'Simulating...' : 'Simulate Conversion'}
                                </Button>
                            </form>
                        </div>
                    </Card>
                )}

                <Card>
                    <h2 className="text-sm font-bold text-slate-950">Campaign Details</h2>
                    <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                        <DetailItem label="Category">{campaign.category || 'Uncategorized'}</DetailItem>
                        <DetailItem label="Expires At">{formatDisplayDate(campaign.expires_at, 'No expiry date')}</DetailItem>
                        <DetailItem label="Destination URL" wide>
                            {campaign.destination_url ? (
                                <a
                                    href={campaign.destination_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="break-all font-medium text-cyan-700 transition hover:text-cyan-800"
                                >
                                    {campaign.destination_url}
                                </a>
                            ) : (
                                'No destination URL'
                            )}
                        </DetailItem>
                        {campaign.description && (
                            <DetailItem label="Description" wide>
                                <span className="whitespace-pre-line break-words">{campaign.description}</span>
                            </DetailItem>
                        )}
                    </dl>
                </Card>

                <ParticipantsModal
                    open={participantsOpen}
                    participants={participants}
                    onClose={() => setParticipantsOpen(false)}
                />
                <PayoutRequestsModal
                    open={payoutRequestsOpen}
                    payoutRequests={payoutRequests}
                    onClose={() => setPayoutRequestsOpen(false)}
                />
            </div>
        </BusinessLayout>
    );
}
