import { Link, useForm } from '@inertiajs/react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import EmptyState from '../../../Components/EmptyState';
import PageHeader from '../../../Components/PageHeader';

function dollars(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function formatDate(value) {
    if (!value) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
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

function PayoutRequestCard({ payoutRequest, billingReady }) {
    const form = useForm({});
    const canApprove = ['pending', 'payment_failed'].includes(payoutRequest.status) && billingReady;

    const approve = () => {
        form.post(`/business/payout-requests/${payoutRequest.id}/approve`, {
            preserveScroll: true,
        });
    };

    return (
        <Card className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-lg font-semibold text-slate-950">{dollars(payoutRequest.amount)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                        {payoutRequest.participant.name} ({payoutRequest.participant.email})
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Requested {formatDate(payoutRequest.requested_at)}</p>
                </div>

                <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(payoutRequest.status)}`}>
                    {payoutRequest.status.replace('_', ' ')}
                </span>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                <div>
                    <p className="font-semibold text-slate-950">Campaign</p>
                    <p className="mt-1">{payoutRequest.campaigns.map((campaign) => campaign.title).join(', ') || 'Campaign reward'}</p>
                </div>
                <div>
                    <p className="font-semibold text-slate-950">Rewards</p>
                    <p className="mt-1">{payoutRequest.rewards_count}</p>
                </div>
                <div>
                    <p className="font-semibold text-slate-950">Stripe</p>
                    <p className="mt-1">{payoutRequest.stripe_payment_status ?? 'Not charged'}</p>
                </div>
            </div>

            {payoutRequest.stripe_failure_reason && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {payoutRequest.stripe_failure_reason}
                </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                    Approved {formatDate(payoutRequest.business_approved_at)} - Paid {formatDate(payoutRequest.paid_at)}
                </p>
                <Button type="button" onClick={approve} disabled={!canApprove || form.processing}>
                    {form.processing ? 'Approving...' : 'Approve Payout'}
                </Button>
            </div>
        </Card>
    );
}

export default function Index({ payoutRequests, billing }) {
    return (
        <BusinessLayout>
            <PageHeader
                title="Payout Requests"
                eyebrow="Business"
                description="Approve payout requests from successful referrals. Your saved card will be charged when you approve."
            />

            {!billing.ready && (
                <Card className="flex flex-col gap-3 border-amber-200 bg-amber-50 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-amber-900">Add a card before approving payout requests.</p>
                    <Button as={Link} href="/business/billing" variant="secondary">Add Card</Button>
                </Card>
            )}

            {payoutRequests.length === 0 ? (
                <EmptyState title="No payout requests yet.">
                    Requests will appear here when participants submit eligible rewards from your campaigns.
                </EmptyState>
            ) : (
                <div className="space-y-4">
                    {payoutRequests.map((payoutRequest) => (
                        <PayoutRequestCard key={payoutRequest.id} payoutRequest={payoutRequest} billingReady={billing.ready} />
                    ))}
                </div>
            )}
        </BusinessLayout>
    );
}
