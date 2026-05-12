<x-mail::message>
# Welcome to SharePlattr

Hi {{ $user->name }},

Your business account is verified and ready to set up.

You can now complete your business profile, create campaigns, and start working with referrers in the SharePlattr marketplace.

<x-mail::button :url="route('business.profile.edit')">
Complete Business Profile
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
