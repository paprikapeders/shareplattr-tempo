<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminSupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');
        $search = trim((string) $request->query('search', ''));

        $counts = SupportTicket::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $tickets = SupportTicket::query()
            ->with(['businessUser:id,name,email'])
            ->withCount('messages')
            ->when($status && array_key_exists($status, SupportTicket::STATUSES), fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(function ($inner) use ($search) {
                $inner->where('subject', 'like', "%{$search}%")
                    ->orWhereHas('businessUser', fn ($userQuery) => $userQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                    );
            }))
            ->latest('updated_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (SupportTicket $ticket) => $this->ticketSummaryPayload($ticket));

        return Inertia::render('Admin/SupportTickets/Index', [
            'tickets' => $tickets,
            'counts' => collect(SupportTicket::STATUSES)
                ->keys()
                ->mapWithKeys(fn ($key) => [$key => (int) ($counts[$key] ?? 0)])
                ->all(),
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'statuses' => SupportTicket::STATUSES,
        ]);
    }

    public function show(SupportTicket $supportTicket)
    {
        $supportTicket->load([
            'businessUser:id,name,email',
            'messages.sender:id,name,email,is_admin,user_type',
            'messages.attachments',
        ])->loadCount('messages');

        return Inertia::render('Admin/SupportTickets/Show', [
            'ticket' => $this->ticketDetailPayload($supportTicket),
            'statuses' => SupportTicket::STATUSES,
        ]);
    }

    public function reply(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        if ($supportTicket->isResolved()) {
            return back()->with('error', 'Resolved tickets cannot receive replies unless reopened.');
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            ...$this->attachmentValidationRules(),
        ], $this->attachmentValidationMessages());

        $message = $supportTicket->messages()->create([
            'sender_id' => $request->user()->id,
            'sender_type' => 'admin',
            'message' => $validated['message'],
        ]);

        $this->storeAttachments($request, $supportTicket, $message);

        if ($supportTicket->status === 'open') {
            $supportTicket->status = 'pending';
        }

        $supportTicket->save();

        return back()->with('success', 'Reply added.');
    }

    public function updateStatus(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(array_keys(SupportTicket::STATUSES))],
        ]);

        $supportTicket->update([
            'status' => $validated['status'],
            'resolved_at' => $validated['status'] === 'resolved' ? now() : null,
        ]);

        return back()->with('success', 'Ticket status updated.');
    }

    private function ticketSummaryPayload(SupportTicket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'subject' => $ticket->subject,
            'business' => [
                'name' => $ticket->businessUser?->name ?? 'Business',
                'email' => $ticket->businessUser?->email,
            ],
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
