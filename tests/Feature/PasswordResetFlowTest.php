<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_uses_same_response_for_existing_and_missing_users(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'Taylor@example.com',
        ]);

        $message = 'If a valid account exists for that email, we will send a password reset link.';

        $this->post(route('password.email'), [
            'email' => ' taylor@EXAMPLE.com ',
        ])->assertSessionHas('success', $message);

        Notification::assertSentTo($user, ResetPassword::class);

        $this->post(route('password.email'), [
            'email' => 'missing@example.com',
        ])->assertSessionHas('success', $message);

        Notification::assertCount(1);
    }
}
