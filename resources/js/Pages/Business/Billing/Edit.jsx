import { useState } from 'react';
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

function BillingForm({ billing }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (event) => {
        event.preventDefault();
        setError(null);
        setProcessing(true);

        try {
            const intentResponse = await window.axios.post('/business/billing/setup-intent');
            const result = await stripe.confirmCardSetup(intentResponse.data.client_secret, {
                payment_method: {
                    card: elements.getElement(CardElement),
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
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <CardElement options={{ hidePostalCode: true }} />
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
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
    const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

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
                            Stripe publishable key is missing. Add STRIPE_KEY before setting up billing.
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
                        {billing?.ready
                            ? 'This business can approve payout requests with the saved card.'
                            : 'Add a card before approving payout requests.'}
                    </p>
                </Card>
            </div>
        </BusinessLayout>
    );
}
