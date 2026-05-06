import { Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Card from '../../../Components/Card';
import EmptyState from '../../../Components/EmptyState';
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

    return 'border-slate-200 bg-white text-slate-700 shadow-slate-950/5 hover:border-slate-300 hover:bg-slate-50';
}

function statusClasses(status) {
    const classes = {
        pending: 'border-amber-200 bg-amber-50 text-amber-800',
        approved: 'border-indigo-200 bg-indigo-50 text-indigo-800',
        processing: 'border-cyan-200 bg-cyan-50 text-cyan-800',
        paid: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        rejected: 'border-rose-200 bg-rose-50 text-rose-800',
        payment_failed: 'border-rose-200 bg-rose-50 text-rose-800',
    };

    return classes[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

function statusLabel(status) {
    return status.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function trackingCopy(payoutRequest) {
    if (payoutRequest.status === 'paid') {
        return `Paid ${formatDate(payoutRequest.paid_at)}${payoutRequest.payout_reference ? ` with reference ${payoutRequest.payout_reference}` : ''}.`;
    }

    if (payoutRequest.status === 'rejected') {
        return payoutRequest.rejection_reason ?? 'Rejected.';
    }

    if (payoutRequest.status === 'approved') {
        return 'Business approved and Stripe charge succeeded.';
    }

    if (payoutRequest.status === 'processing') {
        return 'Payout release is being handled.';
    }

    if (payoutRequest.status === 'payment_failed') {
        return payoutRequest.stripe_failure_reason ?? 'Business card charge failed.';
    }

    return 'Waiting for business approval.';
}

function PayoutRequestRow({ payoutRequest }) {
    return (
        <tr className="align-top transition hover:bg-slate-50/80">
            <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-slate-950">#{payoutRequest.id}</td>
            <td className="px-5 py-5">
                <p className="text-sm font-semibold text-slate-950">{payoutRequest.participant.name}</p>
                <p className="mt-1 text-xs text-slate-500">{payoutRequest.participant.email}</p>
            </td>
            <td className="px-5 py-5 text-sm text-slate-600">
                <div className="space-y-2">
                    {payoutRequest.businesses.map((business) => (
                        <div key={business.id ?? business.name}>
                            <p className="font-medium text-slate-800">{business.name ?? 'Business'}</p>
                            <p className="mt-1 text-xs text-slate-500">{business.email ?? 'No owner email'}</p>
                        </div>
                    ))}
                </div>
            </td>
            <td className="px-5 py-5">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(payoutRequest.status)}`}>
                    {payoutRequest.status.replace('_', ' ')}
                </span>
            </td>
            <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-slate-950">{dollars(payoutRequest.amount)}</td>
            <td className="px-5 py-5 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{payoutRequest.stripe_payment_status ?? 'Not charged'}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{payoutRequest.stripe_payment_intent_id ?? 'No PaymentIntent'}</p>
                {payoutRequest.stripe_failure_reason && (
                    <p className="mt-2 text-xs text-rose-600">{payoutRequest.stripe_failure_reason}</p>
                )}
            </td>
            <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">{formatDate(payoutRequest.requested_at)}</td>
            <td className="px-5 py-5 text-sm text-slate-600">
                <p>{formatDate(payoutRequest.business_approved_at)}</p>
                {payoutRequest.business_approver && (
                    <p className="mt-1 text-xs text-slate-500">
                        {payoutRequest.business_approver.name} ({payoutRequest.business_approver.email})
                    </p>
                )}
            </td>
            <td className="px-5 py-5 text-sm text-slate-600">
                <div className="space-y-2">
                    {payoutRequest.rewards.map((reward) => (
                        <div key={reward.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="font-medium text-slate-900">{reward.campaign_title ?? 'Campaign reward'}</p>
                            <p className="mt-1 text-xs text-slate-500">{reward.business_name ?? 'Business'} - {dollars(reward.amount)}</p>
                        </div>
                    ))}
                </div>
            </td>
            <td className="min-w-64 px-5 py-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {trackingCopy(payoutRequest)}
                </div>
            </td>
        </tr>
    );
}

export default function Index({ payoutRequests, filters, counts, statuses }) {
    const tabs = [
        { label: 'All', value: null, count: counts.all },
        ...statuses.map((status) => ({
            label: statusLabel(status),
            value: status,
            count: counts[status] ?? 0,
        })),
    ];

    return (
        <AdminLayout>
            <PageHeader
                title="Payout Requests"
                eyebrow="Admin"
                description="Monitor payout requests and Stripe payment status."
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
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Request</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Participant</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Business</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Amount</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Stripe</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Requested</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Approval</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Rewards</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Tracking</th>
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
