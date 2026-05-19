<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class LoginRememberMeTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_without_remember_me_uses_normal_session(): void
    {
        $user = User::factory()->create([
            'email' => 'normal-session@example.com',
            'password' => 'password123',
        ]);

        $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password123',
            'remember' => false,
        ])
            ->assertRedirect(route('dashboard'))
            ->assertCookieMissing(Auth::guard('web')->getRecallerName());

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_with_remember_me_sets_recaller_cookie(): void
    {
        $user = User::factory()->create([
            'email' => 'remember-session@example.com',
            'password' => 'password123',
        ]);

        $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password123',
            'remember' => true,
        ])
            ->assertRedirect(route('dashboard'))
            ->assertCookie(Auth::guard('web')->getRecallerName());

        $this->assertAuthenticatedAs($user);
    }
}
