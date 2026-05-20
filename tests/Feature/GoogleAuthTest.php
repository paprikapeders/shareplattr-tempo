<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Campaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_redirect_route_redirects_to_google(): void
    {
        $provider = Mockery::mock();
        $provider->shouldReceive('redirect')
            ->once()
            ->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

        Socialite::shouldReceive('driver')
            ->once()
            ->with('google')
            ->andReturn($provider);

        $this->get(route('auth.google.redirect'))
            ->assertRedirect('https://accounts.google.com/o/oauth2/auth');
    }

    public function test_google_callback_creates_new_user(): void
    {
        $this->mockGoogleUser('google-123', 'Taylor Smith', 'taylor-google@example.com');

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard'));

        $user = User::where('email', 'taylor-google@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertSame('Taylor Smith', $user->name);
        $this->assertSame('google-123', $user->google_id);
        $this->assertSame('participant', $user->user_type);
        $this->assertNotNull($user->email_verified_at);
        $this->assertNotNull($user->password);
    }

    public function test_google_callback_logs_in_existing_user_with_matching_email(): void
    {
        $user = User::factory()->create([
            'email' => 'existing@example.com',
            'email_verified_at' => null,
            'google_id' => null,
            'password' => 'password123',
        ]);

        $this->mockGoogleUser('google-existing', 'Existing User', 'existing@example.com');

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard'));

        $user->refresh();

        $this->assertAuthenticatedAs($user);
        $this->assertSame('google-existing', $user->google_id);
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue(auth()->validate([
            'email' => 'existing@example.com',
            'password' => 'password123',
        ]));
    }

    public function test_google_callback_rejects_missing_email(): void
    {
        $this->mockGoogleUser('google-no-email', 'No Email User', null);

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('login'))
            ->assertSessionHas('error', 'Google did not return an email address. Please use email and password instead.');

        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_google_created_participant_can_see_active_campaigns(): void
    {
        $campaign = Campaign::create([
            'brand_name' => 'Visible Brand',
            'title' => 'Visible Google Campaign',
            'description' => 'A campaign visible to newly created Google participants.',
            'category' => 'Product Launch',
            'category_key' => 'product_launch',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/google-visible',
            'status' => 'active',
            'expires_at' => now()->addMonth(),
        ]);

        Campaign::create([
            'brand_name' => 'Expired Brand',
            'title' => 'Expired Google Campaign',
            'description' => 'A campaign hidden from participants.',
            'category' => 'Product Launch',
            'category_key' => 'product_launch',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/google-expired',
            'status' => 'active',
            'expires_at' => now()->subDay(),
        ]);

        $this->mockGoogleUser('google-visible', 'Visible Participant', 'visible-google@example.com');

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard'));

        $user = User::where('email', 'visible-google@example.com')->firstOrFail();

        $this->assertSame('participant', $user->user_type);
        $this->assertNotNull($user->email_verified_at);

        $this->get(route('campaigns.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Campaigns')
                ->has('campaigns', 1)
                ->where('campaigns.0.id', $campaign->id)
                ->where('campaigns.0.status', 'active')
            );
    }

    private function mockGoogleUser(string $id, ?string $name, ?string $email): void
    {
        $googleUser = (new SocialiteUser())->map([
            'id' => $id,
            'name' => $name,
            'email' => $email,
        ]);

        $provider = Mockery::mock();
        $provider->shouldReceive('user')
            ->once()
            ->andReturn($googleUser);

        Socialite::shouldReceive('driver')
            ->once()
            ->with('google')
            ->andReturn($provider);
    }
}
