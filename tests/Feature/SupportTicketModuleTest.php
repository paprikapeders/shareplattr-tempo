<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\BusinessProfile;
use App\Models\SupportTicketAttachment;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SupportTicketModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_can_create_a_support_ticket(): void
    {
        $business = $this->businessOwnerWithProfile();

        $response = $this
            ->actingAs($business)
            ->post(route('business.support-tickets.store'), [
                'subject' => 'Campaign link is not tracking',
                'category' => 'campaign_issue',
                'priority' => 'high',
                'message' => 'Clicks are not showing on my campaign.',
            ]);

        $ticket = SupportTicket::firstOrFail();

        $response
            ->assertRedirect(route('business.support-tickets.show', $ticket))
            ->assertSessionHas('success', 'Support ticket created.');

        $this->assertDatabaseHas('support_tickets', [
            'id' => $ticket->id,
            'ticket_number' => 'TCK-000001',
            'business_user_id' => $business->id,
            'subject' => 'Campaign link is not tracking',
            'category' => 'campaign_issue',
            'priority' => 'high',
            'status' => 'open',
        ]);

        $this->assertDatabaseHas('support_ticket_messages', [
            'support_ticket_id' => $ticket->id,
            'sender_id' => $business->id,
            'sender_type' => 'business',
            'message' => 'Clicks are not showing on my campaign.',
        ]);
    }

    public function test_business_can_upload_an_image_when_creating_a_ticket(): void
    {
        Storage::fake('public');
        $business = $this->businessOwnerWithProfile();
        $image = $this->fakePng('campaign-proof.png');

        $this
            ->actingAs($business)
            ->post(route('business.support-tickets.store'), [
                'subject' => 'Campaign proof',
                'category' => 'campaign_issue',
                'priority' => 'medium',
                'message' => 'Screenshot attached.',
                'attachments' => [$image],
            ])
            ->assertRedirect();

        $attachment = SupportTicketAttachment::firstOrFail();
        $ticket = SupportTicket::firstOrFail();
        $message = $ticket->messages()->firstOrFail();

        $this->assertSame($ticket->id, $attachment->support_ticket_id);
        $this->assertSame($message->id, $attachment->support_ticket_message_id);
        $this->assertSame($business->id, $attachment->uploaded_by_user_id);
        $this->assertSame('campaign-proof.png', $attachment->original_name);
        Storage::disk('public')->assertExists($attachment->file_path);
    }

    public function test_business_can_view_only_their_own_tickets(): void
    {
        $business = $this->businessOwnerWithProfile('Owner One', 'One Co');
        $otherBusiness = $this->businessOwnerWithProfile('Owner Two', 'Two Co');
        $ownTicket = $this->ticketForBusiness($business, 'Own ticket');
        $this->ticketForBusiness($otherBusiness, 'Other ticket');

        $this
            ->actingAs($business)
            ->get(route('business.support-tickets.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Business/SupportTickets/Index')
                ->has('tickets', 1)
                ->where('tickets.0.id', $ownTicket->id)
                ->where('tickets.0.subject', 'Own ticket')
            );
    }

    public function test_business_cannot_view_another_business_ticket(): void
    {
        $business = $this->businessOwnerWithProfile('Owner One', 'One Co');
        $otherBusiness = $this->businessOwnerWithProfile('Owner Two', 'Two Co');
        $otherTicket = $this->ticketForBusiness($otherBusiness, 'Private ticket');

        $this
            ->actingAs($business)
            ->get(route('business.support-tickets.show', $otherTicket))
            ->assertForbidden();
    }

    public function test_business_can_reply_to_their_own_ticket(): void
    {
        $business = $this->businessOwnerWithProfile();
        $ticket = $this->ticketForBusiness($business);

        $this
            ->actingAs($business)
            ->post(route('business.support-tickets.reply', $ticket), [
                'message' => 'Here is more detail.',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Reply added.');

        $this->assertDatabaseHas('support_ticket_messages', [
            'support_ticket_id' => $ticket->id,
            'sender_id' => $business->id,
            'sender_type' => 'business',
            'message' => 'Here is more detail.',
        ]);
    }

    public function test_business_can_upload_an_image_when_replying(): void
    {
        Storage::fake('public');
        $business = $this->businessOwnerWithProfile();
        $ticket = $this->ticketForBusiness($business);
        $image = $this->fakePng('reply-proof.png');

        $this
            ->actingAs($business)
            ->post(route('business.support-tickets.reply', $ticket), [
                'message' => 'Reply with image.',
                'attachments' => [$image],
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Reply added.');

        $attachment = SupportTicketAttachment::latest('id')->firstOrFail();
        $reply = $ticket->messages()->latest('id')->firstOrFail();

        $this->assertSame($reply->id, $attachment->support_ticket_message_id);
        $this->assertSame($business->id, $attachment->uploaded_by_user_id);
        $this->assertSame('reply-proof.png', $attachment->original_name);
        Storage::disk('public')->assertExists($attachment->file_path);
    }

    public function test_admin_can_view_all_tickets(): void
    {
        $admin = User::factory()->admin()->create();
        $business = $this->businessOwnerWithProfile('Owner One', 'One Co');
        $otherBusiness = $this->businessOwnerWithProfile('Owner Two', 'Two Co');
        $ticket = $this->ticketForBusiness($business, 'First ticket');
        $otherTicket = $this->ticketForBusiness($otherBusiness, 'Second ticket');

        $this
            ->actingAs($admin)
            ->get(route('admin.support-tickets.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/SupportTickets/Index')
                ->has('tickets', 2)
                ->where('tickets.0.id', $otherTicket->id)
                ->where('tickets.1.id', $ticket->id)
            );
    }

    public function test_admin_can_reply_to_a_ticket(): void
    {
        $admin = User::factory()->admin()->create();
        $business = $this->businessOwnerWithProfile();
        $ticket = $this->ticketForBusiness($business);

        $this
            ->actingAs($admin)
            ->post(route('admin.support-tickets.reply', $ticket), [
                'message' => 'We are checking this now.',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Reply added.');

        $this->assertDatabaseHas('support_ticket_messages', [
            'support_ticket_id' => $ticket->id,
            'sender_id' => $admin->id,
            'sender_type' => 'admin',
            'message' => 'We are checking this now.',
        ]);

        $this->assertDatabaseHas('support_tickets', [
            'id' => $ticket->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_upload_an_image_when_replying(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();
        $business = $this->businessOwnerWithProfile();
        $ticket = $this->ticketForBusiness($business);
        $image = $this->fakePng('admin-reply.png');

        $this
            ->actingAs($admin)
            ->post(route('admin.support-tickets.reply', $ticket), [
                'message' => 'Admin screenshot attached.',
                'attachments' => [$image],
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Reply added.');

        $attachment = SupportTicketAttachment::latest('id')->firstOrFail();
        $reply = $ticket->messages()->latest('id')->firstOrFail();

        $this->assertSame($reply->id, $attachment->support_ticket_message_id);
        $this->assertSame($admin->id, $attachment->uploaded_by_user_id);
        $this->assertSame('admin-reply.png', $attachment->original_name);
        Storage::disk('public')->assertExists($attachment->file_path);
    }

    public function test_invalid_attachment_file_types_are_rejected(): void
    {
        Storage::fake('public');
        $business = $this->businessOwnerWithProfile();

        $this
            ->actingAs($business)
            ->post(route('business.support-tickets.store'), [
                'subject' => 'Bad attachment',
                'category' => 'other',
                'priority' => 'low',
                'message' => 'This should fail.',
                'attachments' => [UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf')],
            ])
            ->assertSessionHasErrors('attachments.0');

        $this->assertDatabaseCount('support_ticket_attachments', 0);
    }

    public function test_oversized_attachment_files_are_rejected(): void
    {
        Storage::fake('public');
        $business = $this->businessOwnerWithProfile();

        $this
            ->actingAs($business)
            ->post(route('business.support-tickets.store'), [
                'subject' => 'Large attachment',
                'category' => 'other',
                'priority' => 'low',
                'message' => 'This should fail.',
                'attachments' => [$this->fakePng('huge.png', 5121)],
            ])
            ->assertSessionHasErrors('attachments.0');

        $this->assertDatabaseCount('support_ticket_attachments', 0);
    }

    public function test_business_cannot_view_another_business_ticket_attachment(): void
    {
        Storage::fake('public');
        $business = $this->businessOwnerWithProfile('Owner One', 'One Co');
        $otherBusiness = $this->businessOwnerWithProfile('Owner Two', 'Two Co');

        $this
            ->actingAs($otherBusiness)
            ->post(route('business.support-tickets.store'), [
                'subject' => 'Private attachment',
                'category' => 'other',
                'priority' => 'medium',
                'message' => 'Private screenshot.',
                'attachments' => [$this->fakePng('private.png')],
            ]);

        $ticket = SupportTicket::firstOrFail();

        $this
            ->actingAs($business)
            ->get(route('business.support-tickets.show', $ticket))
            ->assertForbidden();
    }

    public function test_admin_can_view_ticket_attachments(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();
        $business = $this->businessOwnerWithProfile();

        $this
            ->actingAs($business)
            ->post(route('business.support-tickets.store'), [
                'subject' => 'Attachment visible to admin',
                'category' => 'other',
                'priority' => 'medium',
                'message' => 'Admin should see this.',
                'attachments' => [$this->fakePng('visible.png')],
            ]);

        $ticket = SupportTicket::firstOrFail();

        $this
            ->actingAs($admin)
            ->get(route('admin.support-tickets.show', $ticket))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/SupportTickets/Show')
                ->has('ticket.messages.0.attachments', 1)
                ->where('ticket.messages.0.attachments.0.original_name', 'visible.png')
            );
    }

    public function test_admin_can_update_ticket_status(): void
    {
        $admin = User::factory()->admin()->create();
        $business = $this->businessOwnerWithProfile();
        $ticket = $this->ticketForBusiness($business);

        $this
            ->actingAs($admin)
            ->patch(route('admin.support-tickets.status.update', $ticket), [
                'status' => 'ongoing',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Ticket status updated.');

        $this->assertDatabaseHas('support_tickets', [
            'id' => $ticket->id,
            'status' => 'ongoing',
            'resolved_at' => null,
        ]);
    }

    public function test_ticket_counts_by_status_are_correct(): void
    {
        $admin = User::factory()->admin()->create();
        $business = $this->businessOwnerWithProfile();

        $this->ticketForBusiness($business, 'Open ticket', 'open');
        $this->ticketForBusiness($business, 'Pending ticket', 'pending');
        $this->ticketForBusiness($business, 'Ongoing ticket', 'ongoing');
        $this->ticketForBusiness($business, 'Resolved one', 'resolved');
        $this->ticketForBusiness($business, 'Resolved two', 'resolved');

        $this
            ->actingAs($admin)
            ->get(route('admin.support-tickets.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('counts.open', 1)
                ->where('counts.pending', 1)
                ->where('counts.ongoing', 1)
                ->where('counts.resolved', 2)
            );
    }

    public function test_resolved_tickets_block_replies_until_reopened(): void
    {
        $business = $this->businessOwnerWithProfile();
        $admin = User::factory()->admin()->create();
        $ticket = $this->ticketForBusiness($business, 'Resolved ticket', 'resolved');

        $this
            ->actingAs($business)
            ->post(route('business.support-tickets.reply', $ticket), [
                'message' => 'I want to reply.',
            ])
            ->assertRedirect()
            ->assertSessionHas('error', 'Reopen this ticket before adding a reply.');

        $this
            ->actingAs($admin)
            ->post(route('admin.support-tickets.reply', $ticket), [
                'message' => 'Admin reply.',
            ])
            ->assertRedirect()
            ->assertSessionHas('error', 'Resolved tickets cannot receive replies unless reopened.');

        $this
            ->actingAs($business)
            ->patch(route('business.support-tickets.reopen', $ticket))
            ->assertRedirect()
            ->assertSessionHas('success', 'Ticket reopened.');

        $this
            ->actingAs($business)
            ->post(route('business.support-tickets.reply', $ticket), [
                'message' => 'Reply after reopen.',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Reply added.');

        $this->assertDatabaseHas('support_tickets', [
            'id' => $ticket->id,
            'status' => 'open',
            'resolved_at' => null,
        ]);
        $this->assertDatabaseHas('support_ticket_messages', [
            'support_ticket_id' => $ticket->id,
            'message' => 'Reply after reopen.',
        ]);
    }

    private function businessOwnerWithProfile(string $ownerName = 'Business Owner', string $companyName = 'Northstar Coffee'): User
    {
        $owner = User::factory()->businessOwner()->create([
            'name' => $ownerName,
        ]);
        $brand = Brand::create([
            'name' => $companyName,
            'business_type' => 'Retail',
        ]);

        BusinessProfile::create([
            'user_id' => $owner->id,
            'brand_id' => $brand->id,
            'company_name' => $companyName,
            'contact_person_name' => $ownerName,
            'industry' => 'Retail',
            'industry_key' => 'retail',
        ]);

        return $owner;
    }

    private function ticketForBusiness(User $business, string $subject = 'Need help', string $status = 'open'): SupportTicket
    {
        $ticket = SupportTicket::create([
            'business_user_id' => $business->id,
            'subject' => $subject,
            'category' => 'other',
            'priority' => 'medium',
            'status' => $status,
            'resolved_at' => $status === 'resolved' ? now() : null,
        ]);

        $ticket->update([
            'ticket_number' => 'TCK-'.str_pad((string) $ticket->id, 6, '0', STR_PAD_LEFT),
        ]);

        $ticket->messages()->create([
            'sender_id' => $business->id,
            'sender_type' => 'business',
            'message' => 'Original ticket message.',
        ]);

        return $ticket;
    }

    private function fakePng(string $name, ?int $kilobytes = null): UploadedFile
    {
        $content = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=');

        if ($kilobytes !== null) {
            $content .= str_repeat('0', ($kilobytes * 1024) - strlen($content));
        }

        return UploadedFile::fake()->createWithContent($name, $content);
    }
}
