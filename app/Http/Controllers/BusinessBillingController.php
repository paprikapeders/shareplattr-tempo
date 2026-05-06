<?php

namespace App\Http\Controllers;

use App\Services\StripeBillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BusinessBillingController extends Controller
{
    public function __construct(private StripeBillingService $stripe)
    {
    }

    public function edit(Request $request)
    {
        $profile = $request->user()->businessProfile;

        return Inertia::render('Business/Billing/Edit', [
            'stripeKey' => config('services.stripe.key'),
            'billing' => [
                'ready' => (bool) $profile->stripe_billing_ready,
                'card_brand' => $profile->stripe_card_brand,
                'card_last4' => $profile->stripe_card_last4,
                'card_exp_month' => $profile->stripe_card_exp_month,
                'card_exp_year' => $profile->stripe_card_exp_year,
            ],
        ]);
    }

    public function setupIntent(Request $request): JsonResponse
    {
        return response()->json(
            $this->stripe->createSetupIntent($request->user()->businessProfile, $request->user())
        );
    }

    public function savePaymentMethod(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'payment_method_id' => ['required', 'string', 'max:255'],
        ]);

        $this->stripe->savePaymentMethod(
            $request->user()->businessProfile,
            $validated['payment_method_id'],
        );

        return back()->with('success', 'Payment method saved.');
    }
}
