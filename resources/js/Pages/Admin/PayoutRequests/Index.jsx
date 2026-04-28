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

function filterHref(status) {
    return status ? `/admin/payout-requests?status=${status}` : '/admin/payout-requests';
}

function filterClasses(active) {
    if (active) {
        return 'border-slate-950 bg-slate-950 text-white shadow-slate-950/10';
    }

    return 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-slate-950/5';
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

function PayoutRequestRow({ payoutRequest }) {
    const processingForm = useForm({
        admin_notes: '',
    });

    const paidForm = useForm({
        payout_reference: '',
        admin_notes: '',
    });

    const rejectedForm = useForm({
        rejection_reason: '',
        admin_notes: '',
    });

    const markProcessing = (event) => {
        event.preventDefault();

        processingForm.patch(`/admin/payout-requests/${payoutRequest.id}/processing`, {
            preserveScroll: true,
        });
    };

    const markPaid = (event) => {
        event.preventDefault();

        paidForm.patch(`/admin/payout-requests/${payoutRequest.id}/paid`, {
            preserveScroll: true,
        });
    };

    const reject = (event) => {
        event.preventDefault();

        rejectedForm.patch(`/admin/payout-requests/${payoutRequest.id}/rejected`, {
            preserveScroll: true,
        });
    };

    const canProcess = payoutRequest.status === 'pending';
    const canFinalize = payoutRequest.status === 'pending' || payoutRequest.status === 'processing';

    return (
        <tr className="align-top transition hover:bg-slate-50/80">
            <td className="px-5 py-5">
                <p className="text-sm font-semibold text-slate-950">{payoutRequest.participant.name}</p>
                <p className="mt-1 text-xs text-slate-500">{payoutRequest.participant.email}</p>
            </td>
            <td className="px-5 py-5">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(payoutRequest.status)}`}>
                    {payoutRequest.status}
                </span>
            </td>
            <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-slate-950">{dollars(payoutRequest.amount)}</td>
            <td className="px-5 py-5 text-sm text-slate-600">
                {payoutRequest.payout_method ? (
                    <div>
                        <p className="font-medium capitalize text-slate-800">{payoutRequest.payout_method.type}</p>
                        <p className="mt-1 text-xs">{payoutRequest.payout_method.paypal_email}</p>
                    </div>
                ) : (
                    <span className="text-slate-400">Not saved</span>
                )}
            </td>
            <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">{formatDate(payoutRequest.requested_at)}</td>
            <td className="px-5 py-5 text-sm text-slate-600">
                <div className="space-y-2">
                    {payoutRequest.rewards.map((reward) => (
                        <div key={reward.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="font-medium text-slate-900">{reward.campaign_title ?? 'Campaign reward'}</p>
                            <p className="mt-1 text-xs text-slate-500">{dollars(reward.amount)}</p>
                        </div>
                    ))}
                </div>
            </td>
            <td className="min-w-80 px-5 py-5">
                <div className="space-y-4">
                    {canProcess && (
                        <form onSubmit={markProcessing} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <p className="text-sm font-semibold text-slate-950">Move to Processing</p>
                            <Input
                                value={processingForm.data.admin_notes}
                                onChange={(event) => processingForm.setData('admin_notes', event.target.value)}
                                placeholder="Optional admin note"
                            />
                            {processingForm.errors.admin_notes && (
                                <p className="text-sm text-rose-600">{processingForm.errors.admin_notes}</p>
                            )}
                            <Button type="submit" disabled={processingForm.processing} className="w-full">
                                {processingForm.processing ? 'Saving...' : 'Mark Processing'}
                            </Button>
                        </form>
                    )}

                    {canFinalize && (
                        <form onSubmit={markPaid} className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                            <p className="text-sm font-semibold text-slate-950">Mark Paid</p>
                            <Input
                                value={paidForm.data.payout_reference}
                                onChange={(event) => paidForm.setData('payout_reference', event.target.value)}
                                placeholder="PayPal transaction ID"
                            />
                            <Input
                                value={paidForm.data.admin_notes}
                                onChange={(event) => paidForm.setData('admin_notes', event.target.value)}
                                placeholder="Optional admin note"
                            />
                            {paidForm.errors.payout_reference && (
                                <p className="text-sm text-rose-600">{paidForm.errors.payout_reference}</p>
                            )}
                            <Button type="submit" disabled={paidForm.processing} className="w-full">
                                {paidForm.processing ? 'Saving...' : 'Mark Paid'}
                            </Button>
                        </form>
                    )}

                    {canFinalize && (
                        <form onSubmit={reject} className="space-y-2 rounded-xl border border-rose-100 bg-rose-50/70 p-3">
                            <p className="text-sm font-semibold text-slate-950">Reject Request</p>
                            <Input
                                value={rejectedForm.data.rejection_reason}
                                onChange={(event) => rejectedForm.setData('rejection_reason', event.target.value)}
                                placeholder="Reason for rejection"
                            />
                            <Input
                                value={rejectedForm.data.admin_notes}
                                onChange={(event) => rejectedForm.setData('admin_notes', event.target.value)}
                                placeholder="Optional admin note"
                            />
                            {rejectedForm.errors.rejection_reason && (
                                <p className="text-sm text-rose-600">{rejectedForm.errors.rejection_reason}</p>
                            )}
                            <Button type="submit" disabled={rejectedForm.processing} variant="subtle" className="w-full">
                                {rejectedForm.processing ? 'Saving...' : 'Reject'}
                            </Button>
                        </form>
                    )}

                    {!canFinalize && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            {payoutRequest.status === 'paid' && `Paid ${formatDate(payoutRequest.paid_at)}${payoutRequest.payout_reference ? ` with reference ${payoutRequest.payout_reference}` : ''}.`}
                            {payoutRequest.status === 'rejected' && (payoutRequest.rejection_reason ?? 'Rejected.')}
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}

export default function Index({ payoutRequests, filters, counts, statuses }) {
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
                title="Payout Requests"
                eyebrow="Admin"
                description="Track participant payout submissions and complete manual payout processing safely."
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {tabs.map((tab) => {
                    const active = filters.status === tab.value;

                    return (
                        <Link
                            key={tab.label}
                            href={filterHref(tab.value)}
                            className={[
                                'rounded-xl border p-4 shadow-sm transition',
                                filterClasses(active),
                            ].join(' ')}
                        >
                            <span className="block text-xs font-semibold uppercase opacity-70">{tab.label}</span>
                            <span className="mt-2 block text-2xl font-semibold">{tab.count}</span>
                        </Link>
                    );
                })}
            </div>

            {payoutRequests.length === 0 ? (
                <EmptyState title="No payout requests found.">
                    No payout requests match the current status filter.
                </EmptyState>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-100/80">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Participant</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Amount</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">PayPal</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Requested</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Rewards</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {payoutRequests.map((payoutRequest) => (
                                    <PayoutRequestRow key={payoutRequest.id} payoutRequest={payoutRequest} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </AdminLayout>
    );
}
