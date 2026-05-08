<?php

namespace App\Http\Controllers;

use App\Mail\WaitlistWelcomeMail;
use App\Models\WaitlistSubmission;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class WaitlistSubmissionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'type' => ['required', Rule::in(['referrer', 'business'])],
            'source_page' => ['nullable', 'string', 'max:255'],
        ]);

        $email = mb_strtolower(trim($validated['email']));
        $type = $validated['type'];

        $existing = WaitlistSubmission::query()
            ->where('email', $email)
            ->where('type', $type)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'duplicate',
                'message' => 'You are already on this waitlist.',
            ]);
        }

        try {
            $submission = WaitlistSubmission::create([
                'email' => $email,
                'type' => $type,
                'ip_address' => $request->ip(),
                'source_page' => $validated['source_page'] ?? 'landing',
            ]);
        } catch (QueryException $exception) {
            if ($this->isUniqueConstraintViolation($exception)) {
                return response()->json([
                    'status' => 'duplicate',
                    'message' => 'You are already on this waitlist.',
                ]);
            }

            throw $exception;
        }

        $this->sendWelcomeEmail($submission);
        $this->notifyAdmin($submission);

        return response()->json([
            'status' => 'created',
            'message' => 'You are on the list! We will be in touch.',
        ], 201);
    }

    private function sendWelcomeEmail(WaitlistSubmission $submission): void
    {
        try {
            Mail::to($submission->email)->send(new WaitlistWelcomeMail($submission));
        } catch (\Throwable $exception) {
            Log::warning('Waitlist signup saved, but welcome email failed.', [
                'waitlist_submission_id' => $submission->id,
                'email' => $submission->email,
                'type' => $submission->type,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function notifyAdmin(WaitlistSubmission $submission): void
    {
        $adminEmail = config('mail.from.address');

        if (! $adminEmail) {
            return;
        }

        try {
            Mail::raw(
                "New SharePlattr Waitlist Signup\n\n"
                ."Email: {$submission->email}\n"
                ."Type: {$submission->type}\n"
                .'Timestamp: '.$submission->created_at?->toDateTimeString()."\n",
                fn ($message) => $message
                    ->to($adminEmail)
                    ->subject('New SharePlattr Waitlist Signup'),
            );
        } catch (\Throwable $exception) {
            Log::warning('Waitlist signup saved, but admin email notification failed.', [
                'waitlist_submission_id' => $submission->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function isUniqueConstraintViolation(QueryException $exception): bool
    {
        return in_array((string) $exception->getCode(), ['23000', '23505'], true);
    }
}
