<?php

use Illuminate\Support\Facades\Route;

// Handle CORS preflight for web routes
Route::options('{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
})->where('any', '.*');

Route::get('/', function () {
    return response()->json(['message' => 'Boat Rental API']);
});
