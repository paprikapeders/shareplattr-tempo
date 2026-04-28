<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PayoutMethodController extends Controller
{
    /**
     * Store or update the current user's PayPal payout method.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'paypal_email' => ['required', 'email', 'max:255'],
        ]);

        $request->user()->payoutMethod()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'type' => 'paypal',
                'paypal_email' => $validated['paypal_email'],
            ],
        );

        return back()->with('success', 'PayPal payout method saved.');
    }
}
