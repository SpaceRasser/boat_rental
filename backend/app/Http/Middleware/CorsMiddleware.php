<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Handle preflight OPTIONS requests
        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 200);
        } else {
            $response = $next($request);
        }

        // Add CORS headers to ALL responses (including errors and 404s)
        $response->headers->set('Access-Control-Allow-Origin', '*', true);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH', true);
        $response->headers->set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-TOKEN', true);
        $response->headers->set('Access-Control-Allow-Credentials', 'true', true);
        $response->headers->set('Access-Control-Max-Age', '3600', true);
        $response->headers->set('Access-Control-Expose-Headers', 'Content-Length, Content-Range', true);

        return $response;
    }
}
