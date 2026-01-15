<?php

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;

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



    'providers' => ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
        App\Providers\RouteServiceProvider::class,
    ])->toArray(),


];
