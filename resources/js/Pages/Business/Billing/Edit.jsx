import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import PageHeader from '../../../Components/PageHeader';

function cardLabel(billing) {
    if (!billing?.ready) {
        return 'No card saved';
    }

    return `${billing.card_brand ?? 'Card'} ending ${billing.card_last4}, expiry ${String(billing.card_exp_month).padStart(2, '0')}/${billing.card_exp_year}`;
}

function LockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

function CardBrandBadges() {
    return (
        <div className="flex flex-wrap gap-1.5" aria-label="Accepted card brands">
            {['Visa', 'Mastercard', 'Amex'].map((brand) => (
                <span key={brand} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {brand}
                </span>
            ))}
        </div>
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

function BillingForm({ billing }) {
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
            const intentResponse = await window.axios.post('/business/billing/setup-intent');
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

            router.post('/business/billing/payment-method', {
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
        <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="stripe-card-element">
                        Card details
                    </label>
                    <CardBrandBadges />
                </div>

                <div
                    id="stripe-card-element"
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
                    <span>SharePlattr never stores raw card details.</span>
                </div>

                <p className="text-sm leading-6 text-slate-600">
                    Your card is charged when you approve a participant payout request. You will be notified before any charge is made.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                    {error}
                </div>
            )}

            <Button type="submit" disabled={!stripe || processing}>
                {processing ? 'Saving...' : billing?.ready ? 'Update Card' : 'Add Card'}
            </Button>
        </form>
    );
}

export default function Edit({ stripeKey, billing }) {
    const stripePromise = useMemo(() => (stripeKey ? loadStripe(stripeKey) : null), [stripeKey]);

    return (
        <BusinessLayout>
            <PageHeader
                title="Billing"
                eyebrow="Payment method"
                description="Approve payout requests from successful referrals. Your saved card will be charged when you approve."
            />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)]">
                <Card className="space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">Billing / Payment Method</h2>
                        <p className="mt-1 text-sm text-slate-500">{cardLabel(billing)}</p>
                    </div>

                    {!stripePromise ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Stripe could not initialize because the publishable key is missing. Add STRIPE_KEY before setting up billing.
                        </div>
                    ) : (
                        <Elements stripe={stripePromise}>
                            <BillingForm billing={billing} />
                        </Elements>
                    )}
                </Card>

                <Card className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-950">Approval Ready</h2>
                    <p className="text-sm text-slate-600">
                        Approval-ready payouts will appear here after participants request a payout and the conversion has been reviewed. When you approve a payout request, SharePlattr will charge your saved card and release the participant payment.
                    </p>
                    {!billing?.ready && (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                            Add a card before approving payout requests.
                        </p>
                    )}
                </Card>
            </div>
        </BusinessLayout>
    );
}
