<x-mail::message>
# Verify Your Email

Use this 6-digit code to verify your SharePlattr account:

<div style="margin: 24px 0; text-align: center;">
    <span style="display: inline-block; padding: 14px 24px; border-radius: 14px; background: #f4f4ff; color: #3f3a6b; font-size: 32px; font-weight: 700; letter-spacing: 10px;">
        {{ $code }}
    </span>
</div>

This code expires in 10 minutes and can only be used once.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
