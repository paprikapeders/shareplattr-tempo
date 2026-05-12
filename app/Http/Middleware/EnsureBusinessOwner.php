<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        abort_unless($user?->isBusinessOwner(), 403);

        $missingProfileFields = $user->missingBusinessProfileFields();

        if (
            $missingProfileFields !== []
            && ! $request->routeIs('business.profile.edit')
            && ! $request->routeIs('business.profile.update')
        ) {
            return redirect()->route('business.profile.edit')
                ->with('error', 'Please fill in: '.implode(', ', $missingProfileFields).'.');
        }

        return $next($request);
    }
}
