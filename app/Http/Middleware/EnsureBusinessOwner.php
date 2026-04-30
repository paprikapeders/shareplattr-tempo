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

        if (
            ! $user->hasCompleteBusinessProfile()
            && ! $request->routeIs('business.profile.edit')
            && ! $request->routeIs('business.profile.update')
        ) {
            return redirect()->route('business.profile.edit')
                ->with('error', 'Complete your business profile before continuing.');
        }

        return $next($request);
    }
}
