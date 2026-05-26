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
            ->assertRedirect('/campaigns')
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
            ->assertRedirect('/campaigns')
            ->assertCookie(Auth::guard('web')->getRecallerName());

        $this->assertAuthenticatedAs($user);
    }

    public function test_participant_login_does_not_redirect_to_dashboard_intended_url(): void
    {
        $user = User::factory()->create([
            'email' => 'dashboard-intended@example.com',
            'password' => 'password123',
        ]);

        $this
            ->withSession(['url.intended' => 'http://localhost/dashboard'])
            ->post(route('login'), [
                'email' => $user->email,
                'password' => 'password123',
            ])
            ->assertRedirect('/campaigns');
    }

    public function test_participant_login_normalizes_protected_campaign_intended_url_to_relative_path(): void
    {
        $user = User::factory()->create([
            'email' => 'campaign-intended@example.com',
            'password' => 'password123',
        ]);

        $this
            ->withSession(['url.intended' => 'http://localhost:8000/campaigns?search=coffee'])
            ->post(route('login'), [
                'email' => $user->email,
                'password' => 'password123',
            ])
            ->assertRedirect('/campaigns?search=coffee');
    }
}
