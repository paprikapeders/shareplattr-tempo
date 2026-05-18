import { useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ClientLayout from '../../Layouts/ClientLayout';
import Button from '../../Components/Button';
import Card from '../../Components/Card';
import EmptyState from '../../Components/EmptyState';
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
        approved: 'border-indigo-200 bg-indigo-50 text-indigo-800',
        paid: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        rejected: 'border-rose-200 bg-rose-50 text-rose-800',
        payment_failed: 'border-rose-200 bg-rose-50 text-rose-800',
    };

    return classes[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

function savedCardLabel(payoutMethod) {
    if (!payoutMethod?.has_stripe_card) {
        return 'No card saved';
    }

    return `${payoutMethod.card_brand ?? 'Card'} ending ${payoutMethod.card_last4}`;
}

function LockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

const CARD_ELEMENT_OPTIONS = {
    hidePostalCode: true,
    iconStyle: 'solid',
    style: {
        base: {
            color: '#0f172a',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '16px',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#94a3b8',
            },
        },
        invalid: {
            color: '#be123c',
            iconColor: '#be123c',
        },
    },
};

function StripePayoutForm({ payoutMethod }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!stripe || !elements) {
            setError('Stripe is still loading. Please try again in a moment.');
            return;
        }

        setProcessing(true);

        try {
            const intentResponse = await window.axios.post('/payouts/setup-intent');
            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                setError('The secure card field did not load. Refresh the page and try again.');
                return;
            }

            const result = await stripe.confirmCardSetup(intentResponse.data.client_secret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (result.error) {
                setError(result.error.message);
                return;
            }

            router.post('/payouts/payment-method', {
                payment_method_id: result.setupIntent.payment_method,
            }, {
                preserveScroll: true,
            });
        } catch (exception) {
            setError(exception.response?.data?.message ?? 'Unable to save this card right now.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-950/5 transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100"
                aria-label="Secure card details field. Card number, expiration date, and CVC."
            >
                <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <LockIcon />
                    Secured by Stripe
                </span>
                <span className="text-slate-300">/</span>
                <span>SharePlattr does not store your full card number.</span>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                    {error}
                </div>
            )}

            <Button type="submit" disabled={!stripe || processing}>
                {processing ? 'Saving...' : payoutMethod?.has_stripe_card ? 'Update Card' : 'Add card via Stripe'}
            </Button>
        </form>
    );
}

export default function Index({ stripeKey, stats, payoutMethod, payoutRequests }) {
    const payoutRequestForm = useForm({});
    const stripePromise = useMemo(() => (stripeKey ? loadStripe(stripeKey) : null), [stripeKey]);

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
                description="Request payout for eligible rewards and track business approval status."
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
                    <h2 className="text-lg font-semibold text-slate-950">Payout Setup</h2>
                    <p className="mt-1 text-sm text-slate-500">Add a payout method before rewards are ready to process.</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
                    <Card className="space-y-5 p-6">
                        <div>
                            <h3 className="text-base font-semibold text-slate-950">Card payment method</h3>
                            <p className="mt-1 text-sm text-slate-500">{savedCardLabel(payoutMethod)}</p>
                        </div>

                        <p className="text-sm leading-6 text-slate-600">
                            Your card details are securely handled by Stripe. SharePlattr does not store your full card number.
                        </p>

                        {!stripePromise ? (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                Stripe could not initialize because the publishable key is missing. Add STRIPE_KEY before setting up card payouts.
                            </div>
                        ) : (
                            <Elements stripe={stripePromise}>
                                <StripePayoutForm payoutMethod={payoutMethod} />
                            </Elements>
                        )}
                    </Card>

                    <Card className="space-y-3 p-6">
                        <h3 className="text-base font-semibold text-slate-950">Existing PayPal payout</h3>
                        {payoutMethod?.has_paypal ? (
                            <p className="text-sm text-slate-600">
                                PayPal payout method saved for {payoutMethod.paypal_email}.
                            </p>
                        ) : (
                            <p className="text-sm text-slate-600">
                                No PayPal payout method is saved. You can use Stripe card setup here, and existing PayPal payout methods will continue to work.
                            </p>
                        )}
                    </Card>
                </div>
            </section>

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-950">Request Payout</h2>
                    <p className="mt-1 text-sm text-slate-500">Request payout for eligible rewards. The business that owns each campaign approves the request.</p>
                </div>

                <Card className="max-w-2xl space-y-4">
                    {stats.available_balance === 0 ? (
                        <p className="text-sm text-slate-600">
                            You don't have any eligible rewards yet. Share your link and wait for a successful conversion.
                        </p>
                    ) : (
                        <p className="text-sm text-slate-600">
                            Request payout for eligible rewards from verified referrals. Available rewards are grouped by campaign business when you submit.
                        </p>
                    )}
                    <Button
                        type="button"
                        onClick={requestPayout}
                        disabled={payoutRequestForm.processing || stats.available_balance === 0}
                    >
                        {payoutRequestForm.processing ? 'Submitting...' : 'Request Payout'}
                    </Button>
                </Card>
            </section>

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-950">Payout Requests</h2>
                    <p className="mt-1 text-sm text-slate-500">Each request groups every eligible pending reward at the time you submit it.</p>
                </div>

                {payoutRequests.length === 0 ? (
                    <EmptyState title="No payout requests yet.">
                        Request payout when you have pending rewards available.
                    </EmptyState>
                ) : (
                    <div className="space-y-4">
                        {payoutRequests.map((request) => (
                            <Card key={request.id} className="space-y-4 p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-slate-950">{dollars(request.amount)}</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Requested {formatDate(request.requested_at)}
                                        </p>
                                    </div>
                                    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(request.status)}`}>
                                        {request.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
                                    <div>
                                        <dt className="font-semibold text-slate-950">Business Approved</dt>
                                        <dd className="mt-1">{formatDate(request.business_approved_at)}</dd>
                                    </div>
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

                                {request.stripe_payment_status && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        Stripe payment status: {request.stripe_payment_status}
                                    </div>
                                )}

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
                                                <span>{reward.campaign_title ?? 'Campaign reward'}{reward.brand_name ? ` - ${reward.brand_name}` : ''}</span>
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
