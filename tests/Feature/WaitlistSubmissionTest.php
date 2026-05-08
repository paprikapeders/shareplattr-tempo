<?php

namespace Tests\Feature;

use App\Models\WaitlistSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
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
}
