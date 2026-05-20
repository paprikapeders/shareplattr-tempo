<?php

namespace Tests\Feature;

use Database\Seeders\BusinessOwnerSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeededAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_admin_can_login(): void
    {
        $this->seed(UserSeeder::class);

        $this->post(route('login'), [
            'email' => 'admin@shareplattr.test',
            'password' => 'admin12345',
        ])->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticated();
    }

    public function test_seeded_normal_user_can_login(): void
    {
        $this->seed(UserSeeder::class);

        $this->post(route('login'), [
            'email' => 'user@shareplattr.test',
            'password' => 'user12345',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticated();
    }

    public function test_seeded_business_users_can_login(): void
    {
        $this->seed(BusinessOwnerSeeder::class);

        foreach ([
            'business1@shareplattr.test',
            'business2@shareplattr.test',
        ] as $email) {
            $this->post(route('login'), [
                'email' => $email,
                'password' => 'business12345',
            ])->assertRedirect(route('business.dashboard'));

            $this->assertAuthenticated();

            $this->post(route('logout'));
        }
    }
}
