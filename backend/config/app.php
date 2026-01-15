<?php

use Illuminate\Support\Facades\Facade;

return [

    'name' => env('APP_NAME', 'Laravel'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'UTC',
    'locale' => 'ru',
    'fallback_locale' => 'en',
    'faker_locale' => 'ru_RU',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',

    'providers' => [
        Illuminate\Validation\ValidationServiceProvider::class,
        Illuminate\View\ViewServiceProvider::class,
        Illuminate\Translation\TranslationServiceProvider::class,
        Illuminate\Database\DatabaseServiceProvider::class,
        Illuminate\Filesystem\FilesystemServiceProvider::class,
        Illuminate\Foundation\Providers\FoundationServiceProvider::class,
        Illuminate\Routing\RoutingServiceProvider::class,
        Illuminate\Http\HttpServiceProvider::class,
        Illuminate\Session\SessionServiceProvider::class,
        
        // App Service Providers
        App\Providers\AppServiceProvider::class,
        App\Providers\RouteServiceProvider::class,
    ],

];
