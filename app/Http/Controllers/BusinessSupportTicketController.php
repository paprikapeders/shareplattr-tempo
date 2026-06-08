<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BusinessSupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = SupportTicket::query()
            ->where('business_user_id', $request->user()->id)
            ->withCount('messages')
            ->latest('updated_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (SupportTicket $ticket) => $this->ticketSummaryPayload($ticket));

        return Inertia::render('Business/SupportTickets/Index', [
            'tickets' => $tickets,
        ]);
    }

    public function create()
    {
        return Inertia::render('Business/SupportTickets/Create', [
            'categories' => SupportTicket::CATEGORIES,
            'priorities' => SupportTicket::PRIORITIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(array_keys(SupportTicket::CATEGORIES))],
            'priority' => ['required', Rule::in(array_keys(SupportTicket::PRIORITIES))],
            'message' => ['required', 'string', 'max:5000'],
            ...$this->attachmentValidationRules(),
        ], $this->attachmentValidationMessages());

        $ticket = SupportTicket::create([
            'business_user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        $ticket->update([
            'ticket_number' => 'TCK-'.str_pad((string) $ticket->id, 6, '0', STR_PAD_LEFT),
        ]);

        $message = $ticket->messages()->create([
            'sender_id' => $request->user()->id,
            'sender_type' => 'business',
            'message' => $validated['message'],
        ]);

        $this->storeAttachments($request, $ticket, $message);

        return redirect()
            ->route('business.support-tickets.show', $ticket)
            ->with('success', 'Support ticket created.');
    }

    public function show(Request $request, SupportTicket $supportTicket)
    {
        $this->authorizeBusinessTicket($request, $supportTicket);

        $supportTicket->load([
            'businessUser:id,name,email',
            'messages.sender:id,name,email,is_admin,user_type',
            'messages.attachments',
        ])->loadCount('messages');

        return Inertia::render('Business/SupportTickets/Show', [
            'ticket' => $this->ticketDetailPayload($supportTicket),
        ]);
    }

    public function reply(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        $this->authorizeBusinessTicket($request, $supportTicket);

        if ($supportTicket->isResolved()) {
            return back()->with('error', 'Reopen this ticket before adding a reply.');
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            ...$this->attachmentValidationRules(),
        ], $this->attachmentValidationMessages());

        $message = $supportTicket->messages()->create([
            'sender_id' => $request->user()->id,
            'sender_type' => 'business',
            'message' => $validated['message'],
        ]);

        $this->storeAttachments($request, $supportTicket, $message);
        $supportTicket->touch();

        return back()->with('success', 'Reply added.');
    }

    public function resolve(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        $this->authorizeBusinessTicket($request, $supportTicket);

        $supportTicket->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Ticket marked as resolved.');
    }

    public function reopen(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        $this->authorizeBusinessTicket($request, $supportTicket);

        abort_unless($supportTicket->isResolved(), 422);

        $supportTicket->update([
            'status' => 'open',
            'resolved_at' => null,
        ]);

        return back()->with('success', 'Ticket reopened.');
    }

    private function authorizeBusinessTicket(Request $request, SupportTicket $supportTicket): void
    {
        abort_unless((int) $supportTicket->business_user_id === (int) $request->user()->id, 403);
    }

    private function ticketSummaryPayload(SupportTicket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'subject' => $ticket->subject,
            'category' => $ticket->category,
            'category_label' => SupportTicket::CATEGORIES[$ticket->category] ?? $ticket->category,
            'priority' => $ticket->priority,
            'priority_label' => SupportTicket::PRIORITIES[$ticket->priority] ?? $ticket->priority,
            'status' => $ticket->status,
            'status_label' => SupportTicket::STATUSES[$ticket->status] ?? $ticket->status,
            'messages_count' => (int) $ticket->messages_count,
            'created_at' => $ticket->created_at?->toDateTimeString(),
            'updated_at' => $ticket->updated_at?->toDateTimeString(),
        ];
    }

    private function ticketDetailPayload(SupportTicket $ticket): array
    {
        return [
            ...$this->ticketSummaryPayload($ticket),
            'resolved_at' => $ticket->resolved_at?->toDateTimeString(),
            'messages' => $ticket->messages
                ->sortBy('created_at')
                ->values()
                ->map(fn ($message) => [
                    'id' => $message->id,
                    'sender_type' => $message->sender_type,
                    'sender_name' => $message->sender?->name ?? ($message->sender_type === 'admin' ? 'Admin' : 'Business'),
                    'message' => $message->message,
                    'created_at' => $message->created_at?->toDateTimeString(),
                    'attachments' => $message->attachments
                        ->map(fn ($attachment) => [
                            'id' => $attachment->id,
                            'url' => Storage::disk('public')->url($attachment->file_path),
                            'original_name' => $attachment->original_name,
                            'mime_type' => $attachment->mime_type,
                            'size' => (int) $attachment->size,
                        ])
                        ->all(),
                ])
                ->all(),
        ];
    }

    private function attachmentValidationRules(): array
    {
        return [
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    private function attachmentValidationMessages(): array
    {
        return [
            'attachments.array' => 'Attachments must be uploaded as files.',
            'attachments.max' => 'You may upload up to 5 images per message.',
            'attachments.*.file' => 'Each attachment must be a valid file.',
            'attachments.*.image' => 'Each attachment must be an image file.',
            'attachments.*.mimes' => 'Attachments must be JPG, JPEG, PNG, or WEBP images.',
            'attachments.*.max' => 'Each attachment must be 5MB or smaller.',
        ];
    }

    private function storeAttachments(Request $request, SupportTicket $ticket, $message): void
    {
        foreach ($request->file('attachments', []) as $file) {
            $path = $file->storeAs(
                'support-ticket-attachments',
                Str::uuid().'.'.$file->extension(),
                'public',
            );

            $message->attachments()->create([
                'support_ticket_id' => $ticket->id,
                'uploaded_by_user_id' => $request->user()->id,
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                'size' => $file->getSize() ?: 0,
            ]);
        }
    }
}
