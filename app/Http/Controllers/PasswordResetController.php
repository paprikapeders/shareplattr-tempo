<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    private const SENT_MESSAGE = 'If a valid account exists for that email, we will send a password reset link.';

    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'email' => trim((string) $request->input('email')),
        ]);

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $canonicalEmail = User::query()
            ->whereRaw('LOWER(email) = ?', [Str::lower($validated['email'])])
            ->value('email');

        Password::sendResetLink([
            'email' => $canonicalEmail ?? $validated['email'],
        ]);

        return back()
            ->with('success', self::SENT_MESSAGE)
            ->onlyInput('email');
    }

    public function edit(Request $request, string $token): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->merge([
            'email' => trim((string) $request->input('email')),
        ]);

        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $canonicalEmail = User::query()
            ->whereRaw('LOWER(email) = ?', [Str::lower($validated['email'])])
            ->value('email');

        $validated['email'] = $canonicalEmail ?? $validated['email'];

        $status = Password::reset(
            $validated,
            function ($user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('success', __($status))
            : back()->withErrors(['email' => __($status)])->onlyInput('email');
    }
}
