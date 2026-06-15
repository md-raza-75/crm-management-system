<?php

namespace App\Http\Middleware;

use Closure;

class DisableCsrfForApi
{
    public function handle($request, Closure $next)
    {
        // Disable CSRF for API routes
        return $next($request);
    }
}