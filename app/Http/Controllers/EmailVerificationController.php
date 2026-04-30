<?php

namespace App\Http\Controllers;

use App\Mail\VerifyEmailCode;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('login')->with('error', 'Start by creating an account or signing in.');
        }

        if ($user->email_verified_at) {
            $request->session()->forget(['pending_verification_user_id', 'pending_verification_email']);

            return redirect()->route('login')->with('success', 'Your email is already verified. Please sign in.');
        }

        return Inertia::render('Auth/Verify', [
            'email' => $user->email,
            'expiresInSeconds' => $this->secondsRemaining($user),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('login')->with('error', 'Your verification session has expired. Please sign in again.');
        }

        $verificationCode = EmailVerificationCode::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $verificationCode || ! Hash::check($validated['code'], $verificationCode->code)) {
            return back()->withErrors([
                'code' => 'The verification code is invalid or has expired.',
            ]);
        }

        DB::transaction(function () use ($user, $verificationCode) {
            $verificationCode->update([
                'used_at' => now(),
            ]);

            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();
        });

        $request->session()->forget(['pending_verification_user_id', 'pending_verification_email']);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended($this->redirectRouteFor($user));
    }

    public function resend(Request $request): RedirectResponse
    {
        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('login')->with('error', 'Your verification session has expired. Please sign in again.');
        }

        if ($user->email_verified_at) {
            $request->session()->forget(['pending_verification_user_id', 'pending_verification_email']);

            return redirect()->route('login')->with('success', 'Your email is already verified. Please sign in.');
        }

        $plainCode = DB::transaction(function () use ($user) {
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
        });

        Mail::to($user->email)->send(new VerifyEmailCode($user, $plainCode));

        return back()->with('success', 'A new verification code has been sent.');
    }

    private function pendingUser(Request $request): ?User
    {
        $userId = $request->session()->get('pending_verification_user_id');

        if (! $userId) {
            return null;
        }

        return User::query()->find($userId);
    }

    private function secondsRemaining(User $user): int
    {
        $verificationCode = EmailVerificationCode::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->latest()
            ->first();

        if (! $verificationCode) {
            return 0;
        }

        return max(0, now()->diffInSeconds($verificationCode->expires_at, false));
    }

    private function redirectRouteFor(User $user): string
    {
        if ($user->isAdmin()) {
            return route('admin.dashboard');
        }

        if ($user->isBusinessOwner()) {
            return $user->hasCompleteBusinessProfile()
                ? route('business.dashboard')
                : route('business.profile.edit');
        }

        return route('dashboard');
    }
}
