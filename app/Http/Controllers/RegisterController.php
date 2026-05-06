<?php

namespace App\Http\Controllers;

use App\Mail\VerifyEmailCode;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function success(): Response
    {
        return Inertia::render('Auth/RegisterSuccess');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(
            [
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'confirmed', Password::min(8)],
                'account_type' => ['nullable', Rule::in(['participant', 'business_owner'])],
                'terms_accepted' => ['accepted'],
            ],
            [
                'email.unique' => 'This email is already registered. Please sign in or reset your password.',
                'terms_accepted.accepted' => 'Please agree to the Terms of Use and Privacy Policy.',
            ],
        );

        [$user, $plainCode] = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => trim($validated['first_name'].' '.$validated['last_name']),
                'email' => $validated['email'],
                'password' => $validated['password'],
                'user_type' => $validated['account_type'] ?? 'participant',
            ]);

            $plainCode = $this->issueVerificationCode($user);

            return [$user, $plainCode];
        });

        Mail::to($user->email)->send(new VerifyEmailCode($user, $plainCode));

        $request->session()->put('pending_verification_user_id', $user->id);
        $request->session()->put('pending_verification_email', $user->email);

        return redirect()->route('verify.notice')->with('success', 'Account created. Enter the code sent to your email.');
    }

    private function issueVerificationCode(User $user): string
    {
        EmailVerificationCode::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->update([
                'used_at' => now(),
            ]);

        $plainCode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailVerificationCode::create([
            'user_id' => $user->id,
            'code' => Hash::make($plainCode),
            'expires_at' => now()->addMinutes(10),
        ]);

        return $plainCode;
    }
}
