<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@shareplattr.test'],
            [
                'name' => 'Admin User',
                'email_verified_at' => now(),
                'password' => Hash::make('admin12345'),
                'is_admin' => true,
            ],
        );

        User::updateOrCreate(
            ['email' => 'user@shareplattr.test'],
            [
                'name' => 'Participant User',
                'email_verified_at' => now(),
                'password' => Hash::make('user12345'),
                'is_admin' => false,
            ],
        );
    }
}
