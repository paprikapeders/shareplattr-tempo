import { Link, router, useForm } from '@inertiajs/react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import { formatReward } from '../../../Support/rewards';

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

    return status.charAt(0).toUpperCase() + status.slice(1);
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
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <div className="mt-2 text-2xl font-bold text-slate-950">{children ?? value}</div>
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

function ReferralSources({ sources = [] }) {
    return (
        <Card className="p-0">
            <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-950">Referral Sources</h2>
            </div>

            <div className="divide-y divide-slate-100">
                {sources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between px-5 py-3 text-sm">
                        <span className="font-medium text-slate-700">{source.label}</span>
                        <span className="font-bold text-slate-950">{source.clicks}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export default function Show({ campaign }) {
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
                            <MetaItem>{campaign.expires_at ? `Expires ${campaign.expires_at}` : 'No expiry'}</MetaItem>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button as={Link} href={`/business/campaigns/${campaign.id}/edit`} variant="secondary">Edit</Button>
                        <Button as={Link} href={campaign.business_preview_url ?? `/business/campaigns/${campaign.id}/preview`} variant="secondary">View Campaign</Button>
                        <Button as={Link} href={`/business/campaigns/${campaign.id}/stats`}>Stats</Button>
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
                    <MetricCard label="Clicks" value={campaign.click_count ?? 0} />
                    <MetricCard label="Conversions" value={campaign.conversion_count ?? 0} />
                </div>

                <ReferralSources sources={campaign.source_breakdown} />

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
                        <DetailItem label="Expires At">{campaign.expires_at || 'No expiry'}</DetailItem>
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
            </div>
        </BusinessLayout>
    );
}
