<?php

$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

// Register core service providers
$app->register(Illuminate\Validation\ValidationServiceProvider::class);
$app->register(Illuminate\View\ViewServiceProvider::class);
$app->register(Illuminate\Translation\TranslationServiceProvider::class);
$app->register(Illuminate\Database\DatabaseServiceProvider::class);
$app->register(Illuminate\Filesystem\FilesystemServiceProvider::class);
$app->register(Illuminate\Foundation\Providers\FoundationServiceProvider::class);
$app->register(Illuminate\Routing\RoutingServiceProvider::class);
$app->register(Illuminate\Http\HttpServiceProvider::class);
$app->register(Illuminate\Session\SessionServiceProvider::class);

// Register app service providers
$app->register(App\Providers\AppServiceProvider::class);
$app->register(App\Providers\RouteServiceProvider::class);

return $app;
