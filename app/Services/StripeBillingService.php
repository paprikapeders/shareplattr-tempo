<?php

namespace App\Services;

use App\Models\BusinessProfile;
use App\Models\PayoutRequest;
use App\Models\User;
use RuntimeException;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeBillingService
{
    public function __construct(private ?StripeClient $stripe = null)
    {
        $secret = config('services.stripe.secret');

        if (! $this->stripe && filled($secret)) {
            $this->stripe = new StripeClient($secret);
        }
    }

    public function createSetupIntent(BusinessProfile $profile, User $user): array
    {
        $stripe = $this->client();
        $customerId = $profile->stripe_customer_id;

        if (! $customerId) {
            $customer = $stripe->customers->create([
                'email' => $user->email,
                'name' => $profile->company_name,
                'metadata' => [
                    'business_profile_id' => (string) $profile->id,
                    'user_id' => (string) $user->id,
                ],
            ]);

            $customerId = $customer->id;
            $profile->update(['stripe_customer_id' => $customerId]);
        }

        $setupIntent = $stripe->setupIntents->create([
            'customer' => $customerId,
            'payment_method_types' => ['card'],
            'usage' => 'off_session',
        ]);

        return [
            'client_secret' => $setupIntent->client_secret,
        ];
    }

    public function savePaymentMethod(BusinessProfile $profile, string $paymentMethodId): array
    {
        $stripe = $this->client();
        $paymentMethod = $stripe->paymentMethods->retrieve($paymentMethodId);
        $card = $paymentMethod->card;

        $profile->update([
            'stripe_payment_method_id' => $paymentMethod->id,
            'stripe_card_brand' => $card?->brand,
            'stripe_card_last4' => $card?->last4,
            'stripe_card_exp_month' => $card?->exp_month,
            'stripe_card_exp_year' => $card?->exp_year,
            'stripe_billing_ready' => true,
        ]);

        return [
            'payment_method_id' => $paymentMethod->id,
            'brand' => $card?->brand,
            'last4' => $card?->last4,
            'exp_month' => $card?->exp_month,
            'exp_year' => $card?->exp_year,
        ];
    }

    /**
     * @throws ApiErrorException
     */
    public function chargeSavedPaymentMethod(BusinessProfile $profile, PayoutRequest $payoutRequest): array
    {
        $paymentIntent = $this->client()->paymentIntents->create([
            'amount' => (int) $payoutRequest->amount,
            'currency' => 'usd',
            'customer' => $profile->stripe_customer_id,
            'payment_method' => $profile->stripe_payment_method_id,
            'off_session' => true,
            'confirm' => true,
            'description' => 'SharePlattr payout request #'.$payoutRequest->id,
            'metadata' => [
                'payout_request_id' => (string) $payoutRequest->id,
                'business_profile_id' => (string) $profile->id,
                'business_user_id' => (string) $profile->user_id,
                'participant_user_id' => (string) $payoutRequest->user_id,
            ],
        ]);

        return [
            'id' => $paymentIntent->id,
            'status' => $paymentIntent->status,
        ];
    }

    private function client(): StripeClient
    {
        if (! $this->stripe) {
            throw new RuntimeException('Stripe secret key is not configured.');
        }

        return $this->stripe;
    }
}
