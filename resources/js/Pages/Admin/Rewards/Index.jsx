import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import EmptyState from '../../../Components/EmptyState';
import Input from '../../../Components/Input';
import PageHeader from '../../../Components/PageHeader';

function dollars(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

function formatDate(value) {
    if (!value) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

function statusClasses(status) {
    const classes = {
        pending: 'border-amber-200 bg-amber-50 text-amber-800',
        processing: 'border-cyan-200 bg-cyan-50 text-cyan-800',
        paid: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        rejected: 'border-rose-200 bg-rose-50 text-rose-800',
    };

    return classes[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

function filterClasses(status, active) {
    const activeClasses = {
        pending: 'border-amber-300 bg-amber-50 text-amber-900 shadow-amber-950/5',
        processing: 'border-cyan-300 bg-cyan-50 text-cyan-900 shadow-cyan-950/5',
        paid: 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-emerald-950/5',
        rejected: 'border-rose-300 bg-rose-50 text-rose-900 shadow-rose-950/5',
    };

    if (active) {
        return status
            ? activeClasses[status] ?? 'border-slate-300 bg-white text-slate-950 shadow-slate-950/5'
            : 'border-slate-950 bg-slate-950 text-white shadow-slate-950/10';
    }

    return 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-slate-950/5';
}

function RewardRow({ reward }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        payout_reference: '',
    });

    const submit = (event) => {
        event.preventDefault();

        patch(`/admin/rewards/${reward.id}/paid`, {
            preserveScroll: true,
            onSuccess: () => reset('payout_reference'),
        });
    };

    return (
        <tr className="align-top transition hover:bg-slate-50/80">
            <td className="px-5 py-5">
                <p className="text-sm font-semibold text-slate-950">{reward.participant.name}</p>
                <p className="mt-1 text-xs text-slate-500">{reward.participant.email}</p>
            </td>
            <td className="px-5 py-5 text-sm font-medium text-slate-700">{reward.campaign.title}</td>
            <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-slate-950">{dollars(reward.amount)}</td>
            <td className="px-5 py-5">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(reward.status)}`}>
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                    {reward.status}
                </span>
            </td>
            <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">{formatDate(reward.created_at)}</td>
            <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">{formatDate(reward.paid_at)}</td>
            <td className="px-5 py-5 text-sm text-slate-600">
                {reward.payout_reference ?? <span className="text-slate-400">None</span>}
            </td>
            <td className="min-w-64 px-5 py-5">
                {reward.status === 'pending' ? (
                    <form onSubmit={submit} className="space-y-2">
                        <Input
                            value={data.payout_reference}
                            onChange={(event) => setData('payout_reference', event.target.value)}
                            placeholder="Payout reference"
                        />
                        {errors.payout_reference && (
                            <p className="text-sm text-rose-600">{errors.payout_reference}</p>
                        )}
                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Saving...' : 'Mark Paid'}
                        </Button>
                    </form>
                ) : (
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        Read-only
                    </span>
                )}
            </td>
        </tr>
    );
}

function filterHref(status) {
    return status ? `/admin/rewards?status=${status}` : '/admin/rewards';
}

export default function Index({ rewards, filters, counts, statuses }) {
    const tabs = [
        { label: 'All', value: null, count: counts.all },
        ...statuses.map((status) => ({
            label: status[0].toUpperCase() + status.slice(1),
            value: status,
            count: counts[status] ?? 0,
        })),
    ];

    return (
        <AdminLayout>
            <PageHeader
                title="Rewards"
                eyebrow="Admin"
                description="Review rewards by status and monitor payout release references."
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {tabs.map((tab) => {
                    const active = filters.status === tab.value;

                    return (
                        <Link
                            key={tab.label}
                            href={filterHref(tab.value)}
                            className={[
                                'rounded-xl border p-4 shadow-sm transition',
                                filterClasses(tab.value, active),
                            ].join(' ')}
                        >
                            <span className="block text-xs font-semibold uppercase opacity-70">{tab.label}</span>
                            <span className="mt-2 block text-2xl font-semibold">{tab.count}</span>
                        </Link>
                    );
                })}
            </div>

            {rewards.length === 0 ? (
                <EmptyState title="No rewards found.">
                    No rewards match the current status filter.
                </EmptyState>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-100/80">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Participant</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Campaign</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Amount</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Created</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Paid</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Reference</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Manual Payout</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {rewards.map((reward) => (
                                    <RewardRow key={reward.id} reward={reward} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </AdminLayout>
    );
}
