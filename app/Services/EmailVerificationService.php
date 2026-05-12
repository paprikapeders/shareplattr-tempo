<?php

namespace App\Services;

use App\Mail\VerifyEmailCode;
use App\Mail\BusinessWelcomeMail;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class EmailVerificationService
{
    public function issueCode(User $user): string
    {
        return DB::transaction(function () use ($user) {
            $this->expireUnusedCodes($user);

            $plainCode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            EmailVerificationCode::create([
                'user_id' => $user->id,
                'code' => Hash::make($plainCode),
                'expires_at' => now()->addMinutes(10),
            ]);

            return $plainCode;
        });
    }

    public function issueCodeIfNeeded(User $user): ?string
    {
        $hasActiveCode = EmailVerificationCode::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->exists();

        if ($hasActiveCode) {
            return null;
        }

        return $this->issueCode($user);
    }

    public function sendCode(User $user, string $plainCode): void
    {
        try {
            Mail::to($user->email)->send(new VerifyEmailCode($user, $plainCode));
        } catch (Throwable $exception) {
            Log::error('Failed to send email verification code.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'exception' => $exception,
            ]);

            throw $exception;
        }
    }

    public function sendBusinessWelcomeEmailIfNeeded(User $user): bool
    {
        if (! $user->isBusinessOwner()) {
            return false;
        }

        return DB::transaction(function () use ($user) {
            $lockedUser = User::query()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedUser->welcome_email_sent_at) {
                return false;
            }

            try {
                Mail::to($lockedUser->email)->send(new BusinessWelcomeMail($lockedUser));
            } catch (Throwable $exception) {
                Log::error('Failed to send business welcome email.', [
                    'user_id' => $lockedUser->id,
                    'email' => $lockedUser->email,
                    'exception' => $exception,
                ]);

                throw $exception;
            }

            $lockedUser->forceFill([
                'welcome_email_sent_at' => now(),
            ])->save();

            return true;
        });
    }

    private function expireUnusedCodes(User $user): void
    {
        EmailVerificationCode::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->update([
                'used_at' => now(),
            ]);
    }
}
