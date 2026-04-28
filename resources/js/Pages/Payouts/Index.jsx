import { useForm } from '@inertiajs/react';
import ClientLayout from '../../Layouts/ClientLayout';
import Button from '../../Components/Button';
import Card from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
import Input from '../../Components/Input';
import PageHeader from '../../Components/PageHeader';
import StatCard from '../../Components/StatCard';

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

export default function Index({ stats, payoutMethod, payoutRequests }) {
    const payoutMethodForm = useForm({
        paypal_email: payoutMethod?.paypal_email ?? '',
    });

    const payoutRequestForm = useForm({});

    const savePayoutMethod = (event) => {
        event.preventDefault();

        payoutMethodForm.put('/payout-method', {
            preserveScroll: true,
        });
    };

    const requestPayout = () => {
        payoutRequestForm.post('/payout-requests', {
            preserveScroll: true,
        });
    };

    return (
        <ClientLayout>
            <PageHeader
                title="Payouts"
                eyebrow="Your rewards"
                description="Save your PayPal email, review payout history, and request payout for eligible pending rewards."
            >
                <Button
                    type="button"
                    onClick={requestPayout}
                    disabled={payoutRequestForm.processing || stats.available_balance === 0}
                >
                    {payoutRequestForm.processing ? 'Submitting...' : 'Request Payout'}
                </Button>
            </PageHeader>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Available Balance" value={dollars(stats.available_balance)} tone="emerald" />
                <StatCard label="Pending Rewards" value={stats.pending_rewards_count} tone="slate" />
                <StatCard label="Processing Rewards" value={stats.processing_rewards_count} tone="cyan" />
                <StatCard label="Paid Rewards" value={stats.paid_rewards_count} tone="slate" />
            </div>

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-950">Payout Method</h2>
                    <p className="mt-1 text-sm text-slate-500">Share the PayPal email admins should use for manual payouts.</p>
                </div>

                <Card className="max-w-2xl">
                    <form onSubmit={savePayoutMethod} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">PayPal Email</label>
                            <Input
                                type="email"
                                value={payoutMethodForm.data.paypal_email}
                                onChange={(event) => payoutMethodForm.setData('paypal_email', event.target.value)}
                                placeholder="you@example.com"
                                className="mt-1"
                            />
                            {payoutMethodForm.errors.paypal_email && (
                                <p className="mt-1 text-sm text-rose-600">{payoutMethodForm.errors.paypal_email}</p>
                            )}
                        </div>

                        {payoutMethod?.paypal_email && (
                            <p className="text-sm text-slate-500">
                                Current saved PayPal email: <span className="font-medium text-slate-800">{payoutMethod.paypal_email}</span>
                            </p>
                        )}

                        <Button type="submit" disabled={payoutMethodForm.processing}>
                            {payoutMethodForm.processing ? 'Saving...' : 'Save PayPal Email'}
                        </Button>
                    </form>
                </Card>
            </section>

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-950">Payout Requests</h2>
                    <p className="mt-1 text-sm text-slate-500">Each request groups every eligible pending reward at the time you submit it.</p>
                </div>

                {payoutRequests.length === 0 ? (
                    <EmptyState title="No payout requests yet.">
                        Save your PayPal email, then request payout when you have pending rewards available.
                    </EmptyState>
                ) : (
                    <div className="space-y-4">
                        {payoutRequests.map((request) => (
                            <Card key={request.id} className="space-y-4 p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-slate-950">{dollars(request.amount)}</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Requested {formatDate(request.requested_at)}{request.paypal_email ? ` to ${request.paypal_email}` : ''}
                                        </p>
                                    </div>
                                    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>

                                <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
                                    <div>
                                        <dt className="font-semibold text-slate-950">Processed</dt>
                                        <dd className="mt-1">{formatDate(request.processed_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold text-slate-950">Paid</dt>
                                        <dd className="mt-1">{formatDate(request.paid_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold text-slate-950">Reference</dt>
                                        <dd className="mt-1">{request.payout_reference ?? 'Not set'}</dd>
                                    </div>
                                </dl>

                                {request.rejection_reason && (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                                        {request.rejection_reason}
                                    </div>
                                )}

                                {request.admin_notes && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        {request.admin_notes}
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-semibold text-slate-950">Included Rewards</p>
                                    <div className="mt-3 space-y-2">
                                        {request.rewards.map((reward) => (
                                            <div key={reward.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                                                <span>{reward.campaign_title ?? 'Campaign reward'}</span>
                                                <span className="font-medium text-slate-950">{dollars(reward.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </ClientLayout>
    );
}
