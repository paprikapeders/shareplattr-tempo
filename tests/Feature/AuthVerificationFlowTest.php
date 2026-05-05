<?php

namespace Tests\Feature;

use App\Mail\VerifyEmailCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthVerificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_must_verify_email_code_before_being_logged_in(): void
    {
        Mail::fake();

        $response = $this->post(route('register'), [
            'first_name' => 'Taylor',
            'last_name' => 'Smith',
            'email' => 'taylor@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('verify.notice'));

        $user = User::where('email', 'taylor@example.com')->firstOrFail();

        $this->assertNull($user->email_verified_at);
        $this->assertDatabaseCount('email_verification_codes', 1);
        $this->assertGuest();

        $sentCode = null;

        Mail::assertSent(VerifyEmailCode::class, function (VerifyEmailCode $mail) use ($user, &$sentCode) {
            $sentCode = $mail->code;

            return $mail->hasTo($user->email);
        });

        $this->withSession([
            'pending_verification_user_id' => $user->id,
            'pending_verification_email' => $user->email,
        ])->post(route('verify.store'), [
            'code' => $sentCode,
        ])->assertRedirect(route('register.success'));

        $this->assertAuthenticatedAs($user->fresh());
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertDatabaseHas('email_verification_codes', [
            'user_id' => $user->id,
        ]);
    }

    public function test_unverified_user_login_redirects_to_verification(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'pending@example.com',
            'email_verified_at' => null,
            'password' => 'password123',
        ]);

        $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertRedirect(route('verify.notice'));

        $this->assertGuest();
        $this->assertDatabaseCount('email_verification_codes', 1);
        Mail::assertSent(VerifyEmailCode::class);
    }

    public function test_unverified_user_can_verify_with_existing_registration_code_after_later_login(): void
    {
        Mail::fake();

        $this->post(route('register'), [
            'first_name' => 'Casey',
            'last_name' => 'Jones',
            'email' => 'casey@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertRedirect(route('verify.notice'));

        $user = User::where('email', 'casey@example.com')->firstOrFail();
        $sentCode = null;

        Mail::assertSent(VerifyEmailCode::class, function (VerifyEmailCode $mail) use ($user, &$sentCode) {
            $sentCode = $mail->code;

            return $mail->hasTo($user->email);
        });

        $this->flushSession();
        Mail::fake();

        $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertRedirect(route('verify.notice'));

        Mail::assertNothingSent();

        $this->post(route('verify.store'), [
            'code' => $sentCode,
        ])->assertRedirect(route('register.success'));

        $this->assertAuthenticatedAs($user->fresh());
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_registration_with_existing_email_shows_custom_validation_error(): void
    {
        User::factory()->create([
            'email' => 'taken@example.com',
        ]);

        $this->post(route('register'), [
            'first_name' => 'Taylor',
            'last_name' => 'Smith',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertSessionHasErrors([
            'email' => 'This email is already registered. Please sign in or reset your password.',
        ]);

        $this->assertDatabaseCount('users', 1);
    }
}
