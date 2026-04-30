<?php

namespace App\Http\Controllers;

use App\Mail\VerifyEmailCode;
use App\Models\EmailVerificationCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        if (! $request->user()->email_verified_at) {
            $user = $request->user();

            Auth::logout();

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

            $request->session()->put('pending_verification_user_id', $user->id);
            $request->session()->put('pending_verification_email', $user->email);

            return redirect()->route('verify.notice')->with('error', 'Verify your email before signing in.');
        }

        $request->session()->regenerate();

        return redirect()->intended($this->redirectRouteFor($request->user()));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function redirectRouteFor($user): string
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
