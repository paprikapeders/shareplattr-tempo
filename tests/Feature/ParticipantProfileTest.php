<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ParticipantProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_can_view_profile_edit_page(): void
    {
        $participant = User::factory()->create([
            'name' => 'Taylor Participant',
            'email' => 'taylor@example.com',
        ]);

        $this
            ->actingAs($participant)
            ->get(route('profile.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Profile/Edit')
                ->where('profile.name', 'Taylor Participant')
                ->where('profile.email', 'taylor@example.com')
            );
    }

    public function test_participant_can_update_profile_name(): void
    {
        $participant = User::factory()->create(['name' => 'Old Name']);

        $this
            ->actingAs($participant)
            ->post(route('profile.update'), [
                'name' => 'New Name',
            ])
            ->assertRedirect(route('profile.edit'));

        $this->assertDatabaseHas('users', [
            'id' => $participant->id,
            'name' => 'New Name',
        ]);
    }

    public function test_profile_name_is_required(): void
    {
        $participant = User::factory()->create(['name' => 'Current Name']);

        $this
            ->actingAs($participant)
            ->from(route('profile.edit'))
            ->post(route('profile.update'), [
                'name' => '',
            ])
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHasErrors('name');

        $this->assertDatabaseHas('users', [
            'id' => $participant->id,
            'name' => 'Current Name',
        ]);
    }
}
