<?php

namespace Tests\Feature;

use App\Mail\BusinessWelcomeMail;
use App\Mail\VerifyEmailCode;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
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
            'terms_accepted' => true,
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

    public function test_business_registration_creates_verification_code_sends_email_and_redirects_to_verify_screen(): void
    {
        Mail::fake();

        $this->post(route('register'), [
            'first_name' => 'Business',
            'last_name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'account_type' => 'business_owner',
            'terms_accepted' => true,
        ])->assertRedirect(route('verify.notice'));

        $user = User::where('email', 'owner@example.com')->firstOrFail();

        $this->assertSame('business_owner', $user->user_type);
        $this->assertNull($user->email_verified_at);
        $this->assertDatabaseHas('email_verification_codes', [
            'user_id' => $user->id,
            'used_at' => null,
        ]);
        $this->assertGuest();

        Mail::assertSent(VerifyEmailCode::class, function (VerifyEmailCode $mail) use ($user) {
            return $mail->hasTo($user->email);
        });

        $this->get(route('verify.notice'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Verify')
                ->where('email', 'owner@example.com')
                ->where('editRegistrationUrl', route('register.business', ['email' => 'owner@example.com']))
            );
    }

    public function test_business_welcome_email_is_sent_once_after_successful_verification(): void
    {
        Mail::fake();

        $this->post(route('register'), [
            'first_name' => 'Business',
            'last_name' => 'Owner',
            'email' => 'verified-owner@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'account_type' => 'business_owner',
            'terms_accepted' => true,
        ])->assertRedirect(route('verify.notice'));

        $user = User::where('email', 'verified-owner@example.com')->firstOrFail();
        $sentCode = null;

        Mail::assertSent(VerifyEmailCode::class, function (VerifyEmailCode $mail) use ($user, &$sentCode) {
            $sentCode = $mail->code;

            return $mail->hasTo($user->email);
        });

        Mail::assertNotSent(BusinessWelcomeMail::class);

        $this->withSession([
            'pending_verification_user_id' => $user->id,
            'pending_verification_email' => $user->email,
        ])->post(route('verify.store'), [
            'code' => $sentCode,
        ])->assertRedirect(route('register.success'));

        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertNotNull($user->fresh()->welcome_email_sent_at);

        Mail::assertSent(BusinessWelcomeMail::class, function (BusinessWelcomeMail $mail) use ($user) {
            return $mail->hasTo($user->email);
        });

        $this->withSession([
            'pending_verification_user_id' => $user->id,
            'pending_verification_email' => $user->email,
        ])->post(route('verify.store'), [
            'code' => $sentCode,
        ]);

        Mail::assertSent(BusinessWelcomeMail::class, 1);
    }

    public function test_business_registration_verification_get_started_points_to_business_onboarding(): void
    {
        Mail::fake();

        $this->post(route('register'), [
            'first_name' => 'Business',
            'last_name' => 'Owner',
            'email' => 'business-start@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'account_type' => 'business_owner',
            'terms_accepted' => true,
        ])->assertRedirect(route('verify.notice'));

        $user = User::where('email', 'business-start@example.com')->firstOrFail();
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
        $this->assertSame('business_owner', $user->fresh()->user_type);

        $this->get(route('register.success'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/RegisterSuccess')
                ->where('redirectUrl', route('business.profile.edit'))
            );
    }

    public function test_participant_registration_verification_get_started_points_to_client_dashboard(): void
    {
        Mail::fake();

        $this->post(route('register'), [
            'first_name' => 'Client',
            'last_name' => 'User',
            'email' => 'client-start@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'account_type' => 'participant',
            'terms_accepted' => true,
        ])->assertRedirect(route('verify.notice'));

        $user = User::where('email', 'client-start@example.com')->firstOrFail();
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
        $this->assertSame('participant', $user->fresh()->user_type);

        $this->get(route('register.success'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/RegisterSuccess')
                ->where('redirectUrl', route('dashboard'))
            );
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
            'terms_accepted' => true,
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
            'terms_accepted' => true,
        ])->assertSessionHasErrors([
            'email' => 'This email is already registered. Please sign in or reset your password.',
        ]);

        $this->assertDatabaseCount('users', 1);
    }

    public function test_pending_registration_can_correct_email_without_creating_duplicate_user(): void
    {
        Mail::fake();

        $this->post(route('register'), [
            'first_name' => 'Taylor',
            'last_name' => 'Smith',
            'email' => 'mistyped@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'account_type' => 'business_owner',
            'terms_accepted' => true,
        ])->assertRedirect(route('verify.notice'));

        $user = User::where('email', 'mistyped@example.com')->firstOrFail();
        $oldCode = EmailVerificationCode::where('user_id', $user->id)->firstOrFail();

        $this->post(route('register'), [
            'first_name' => 'Taylor',
            'last_name' => 'Smith',
            'email' => 'corrected@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'account_type' => 'business_owner',
            'terms_accepted' => true,
        ])->assertRedirect(route('verify.notice'));

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'corrected@example.com',
            'user_type' => 'business_owner',
        ]);
        $this->assertNotNull($oldCode->fresh()->used_at);
        $this->assertSame(1, EmailVerificationCode::where('user_id', $user->id)->whereNull('used_at')->count());

        Mail::assertSent(VerifyEmailCode::class, 2);
        Mail::assertSent(VerifyEmailCode::class, function (VerifyEmailCode $mail) {
            return $mail->hasTo('corrected@example.com');
        });
    }
}
