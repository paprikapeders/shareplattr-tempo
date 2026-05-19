<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\EmailVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function __construct(private EmailVerificationService $emailVerificationService)
    {
    }

    public function create(Request $request): Response
    {
        $pendingUser = $this->editablePendingUser($request);

        return Inertia::render('Auth/Register', [
            'prefill' => [
                'first_name' => $pendingUser ? $this->firstName($pendingUser) : '',
                'last_name' => $pendingUser ? $this->lastName($pendingUser) : '',
                'email' => (string) $request->query('email', ''),
                'account_type' => $this->accountTypeFromRequest($request),
            ],
        ]);
    }

    public function createBusiness(Request $request): Response
    {
        $pendingUser = $this->editablePendingUser($request);

        return Inertia::render('Auth/Register', [
            'prefill' => [
                'first_name' => $pendingUser ? $this->firstName($pendingUser) : '',
                'last_name' => $pendingUser ? $this->lastName($pendingUser) : '',
                'email' => (string) $request->query('email', ''),
                'account_type' => 'business',
            ],
        ]);
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Auth/RegisterSuccess', [
            'redirectUrl' => $request->user()
                ? $this->redirectUrlFor($request->user())
                : route('dashboard'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $pendingUser = $this->editablePendingUser($request);

        $validated = $request->validate(
            [
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')->ignore($pendingUser?->id),
                ],
                'password' => ['required', Password::min(8)],
                'account_type' => ['required', Rule::in(['participant', 'business'])],
            ],
            [
                'email.unique' => 'This email is already registered. Please sign in or reset your password.',
                'account_type.required' => 'Choose an account type to continue.',
            ],
        );

        $user = DB::transaction(function () use ($validated, $pendingUser) {
            $attributes = [
                'name' => trim($validated['first_name'].' '.$validated['last_name']),
                'email' => $validated['email'],
                'password' => $validated['password'],
                'user_type' => $this->userTypeFromAccountType($validated['account_type']),
            ];

            if ($pendingUser) {
                $pendingUser->forceFill($attributes)->save();

                return $pendingUser->fresh();
            }

            return User::create($attributes);
        });

        $plainCode = $this->emailVerificationService->issueCode($user);
        $this->emailVerificationService->sendCode($user, $plainCode);

        $request->session()->put('pending_verification_user_id', $user->id);
        $request->session()->put('pending_verification_email', $user->email);

        return redirect()->route('verify.notice')->with('success', 'Account created. Enter the code sent to your email.');
    }

    private function editablePendingUser(Request $request): ?User
    {
        $userId = $request->session()->get('pending_verification_user_id');

        if (! $userId) {
            return null;
        }

        return User::query()
            ->whereKey($userId)
            ->whereNull('email_verified_at')
            ->first();
    }

    private function accountTypeFromRequest(Request $request): string
    {
        return match ($request->query('account_type')) {
            'participant' => 'participant',
            'business', 'business_owner' => 'business',
            default => '',
        };
    }

    private function userTypeFromAccountType(string $accountType): string
    {
        return $accountType === 'business' ? 'business_owner' : 'participant';
    }

    private function redirectUrlFor(User $user): string
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

    private function firstName(User $user): string
    {
        return str($user->name)->beforeLast(' ')->toString() ?: $user->name;
    }

    private function lastName(User $user): string
    {
        return str($user->name)->contains(' ')
            ? str($user->name)->afterLast(' ')->toString()
            : '';
    }
}
