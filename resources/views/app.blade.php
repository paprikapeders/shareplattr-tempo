<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'SharePlattr') }}</title>
    <meta name="theme-color" content="#28a9cd">
    <meta property="og:image" content="{{ url('/images/logos/full_logo_trans.png?v=20260522') }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{{ url('/images/logos/full_logo_trans.png?v=20260522') }}">
    <link rel="icon" href="/favicon.ico?v=20260522" sizes="any">
    <link rel="icon" type="image/png" href="/favicon.png?v=20260522">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=20260522">
    <link rel="manifest" href="/site.webmanifest?v=20260522">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    <link rel="preload" as="image" href="/images/people.png" fetchpriority="high" />
    <link rel="preload" as="image" href="/images/logos/full_logo_trans.png?v=20260522" fetchpriority="high" />

    <!-- Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>
