<?php

namespace Tests\Feature;

use App\Models\WaitlistSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WaitlistSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_join_waitlist(): void
    {
        Mail::fake();

        $this
            ->postJson(route('waitlist.store'), [
                'email' => 'NewUser@Example.com',
                'type' => 'referrer',
                'source_page' => 'landing',
            ])
            ->assertCreated()
            ->assertJson([
                'status' => 'created',
            ]);

        $this->assertDatabaseHas('waitlist_submissions', [
            'email' => 'newuser@example.com',
            'type' => 'referrer',
            'source_page' => 'landing',
        ]);
    }

    public function test_duplicate_waitlist_submission_returns_duplicate_status(): void
    {
        Mail::fake();

        WaitlistSubmission::create([
            'email' => 'joined@example.com',
            'type' => 'business',
            'source_page' => 'landing',
        ]);

        $this
            ->postJson(route('waitlist.store'), [
                'email' => 'joined@example.com',
                'type' => 'business',
            ])
            ->assertOk()
            ->assertJson([
                'status' => 'duplicate',
            ]);

        $this->assertSame(1, WaitlistSubmission::query()->where('email', 'joined@example.com')->where('type', 'business')->count());
    }

    public function test_waitlist_submission_validates_input(): void
    {
        $this
            ->postJson(route('waitlist.store'), [
                'email' => 'not-an-email',
                'type' => 'customer',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'type']);
    }

    public function test_admin_can_view_waitlist_submissions(): void
    {
        $admin = User::factory()->admin()->create();
        $businessSubmission = WaitlistSubmission::create([
            'email' => 'business@example.com',
            'type' => 'business',
            'source_page' => 'landing',
        ]);
        WaitlistSubmission::create([
            'email' => 'referrer@example.com',
            'type' => 'referrer',
            'source_page' => 'landing',
        ]);

        $this
            ->actingAs($admin)
            ->get(route('admin.waitlist.index', [
                'type' => 'business',
                'search' => 'business',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Waitlist/Index')
                ->where('filters.type', 'business')
                ->where('filters.search', 'business')
                ->where('submissions.0.id', $businessSubmission->id)
                ->where('submissions.0.email', 'business@example.com')
                ->where('submissions.0.type', 'business')
                ->where('submissions.0.source_page', 'landing')
                ->missing('submissions.1')
            );
    }
}
