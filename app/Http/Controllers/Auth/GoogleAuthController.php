<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    private const PARTICIPANT_HOME = '/campaigns';

    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();
        $email = $googleUser->getEmail();

        if (! $email) {
            return redirect()
                ->route('login')
                ->with('error', 'Google did not return an email address. Please use email and password instead.');
        }

        $user = User::query()->where('email', $email)->first();

        if ($user) {
            $user->forceFill([
                'google_id' => $user->google_id ?: $googleUser->getId(),
                'email_verified_at' => $user->email_verified_at ?: now(),
            ])->save();
        } else {
            $user = User::create([
                'name' => $this->nameFromGoogle($googleUser->getName(), $email),
                'email' => $email,
                'google_id' => $googleUser->getId(),
                'email_verified_at' => now(),
                'password' => Str::password(40),
                'user_type' => 'participant',
            ]);
        }

        Auth::login($user);

        $request->session()->regenerate();

        if ($user->isParticipant()) {
            $this->normalizeParticipantIntendedUrl($request);

            return redirect()->intended(self::PARTICIPANT_HOME);
        }

        $request->session()->forget('url.intended');

        return redirect()->to($this->redirectRouteFor($user));
    }

    private function nameFromGoogle(?string $name, string $email): string
    {
        $name = trim((string) $name);

        if ($name !== '') {
            return $name;
        }

        return Str::of($email)->before('@')->replace(['.', '_', '-'], ' ')->title()->toString();
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

        return self::PARTICIPANT_HOME;
    }

    private function normalizeParticipantIntendedUrl(Request $request): void
    {
        $intended = $request->session()->get('url.intended');

        if (! is_string($intended) || $intended === '') {
            return;
        }

        $path = parse_url($intended, PHP_URL_PATH) ?: '';
        $query = parse_url($intended, PHP_URL_QUERY);

        if (in_array($path, ['/campaigns', '/profile', '/payouts'], true) || str_starts_with($path, '/campaigns/')) {
            $request->session()->put('url.intended', $path.($query ? '?'.$query : ''));

            return;
        }

        $request->session()->forget('url.intended');
    }
}
