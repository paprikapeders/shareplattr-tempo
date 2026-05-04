<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test {recipient : The email address that should receive the test message}', function (string $recipient) {
    $this->info('Sending a SharePlattr test email to '.$recipient.' using the configured mailer.');

    Mail::raw('This is a SharePlattr test email sent using the current configured mailer.', function ($message) use ($recipient) {
        $message
            ->to($recipient)
            ->subject('SharePlattr test email');
    });

    $this->info('Test email sent.');
})->purpose('Send a basic test email using the current configured mailer');
