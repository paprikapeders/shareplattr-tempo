<?php

namespace App\Http\Controllers;

use App\Services\EmailVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(private EmailVerificationService $emailVerificationService)
    {
    }

    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $credentials = [
            'email' => $validated['email'],
            'password' => $validated['password'],
        ];

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        if (! $request->user()->email_verified_at) {
            $user = $request->user();

            Auth::logout();

            $request->session()->put('pending_verification_user_id', $user->id);
            $request->session()->put('pending_verification_email', $user->email);

            $plainCode = $this->emailVerificationService->issueCodeIfNeeded($user);

            if ($plainCode) {
                $this->emailVerificationService->sendCode($user, $plainCode);
            }

            return redirect()->route('verify.notice')->with('error', 'Verify your email before signing in.');
        }

        $request->session()->regenerate();

        $request->session()->forget('url.intended');

        return redirect()->to($this->redirectRouteFor($request->user()));
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
