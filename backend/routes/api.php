<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BoatController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BoatOrderController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working', 'cors' => 'enabled'], 200)
        ->header('Access-Control-Allow-Origin', '*');
});

// Handle CORS preflight for all routes
Route::options('{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-TOKEN')
        ->header('Access-Control-Max-Age', '3600');
})->where('any', '.*');

// Auth routes
Route::post('/auth/login.php', [AuthController::class, 'login']);
Route::get('/auth/get_current.php', [AuthController::class, 'getCurrent']);

// Users routes
Route::get('/users/get.php', [UserController::class, 'index']);
Route::post('/users/create.php', [UserController::class, 'store']);
Route::post('/users/update_simple.php', [UserController::class, 'update']);
Route::delete('/users/delete.php', [UserController::class, 'destroy']);

// Boats routes
Route::get('/boats/get.php', [BoatController::class, 'index']);
Route::post('/boats/create.php', [BoatController::class, 'store']);
Route::put('/boats/update.php', [BoatController::class, 'update']);
Route::match(['put', 'post'], '/boats/update.php', [BoatController::class, 'update']);
Route::delete('/boats/delete.php', [BoatController::class, 'destroy']);

// Products routes
Route::get('/products/get.php', [ProductController::class, 'index']);
Route::post('/products/create.php', [ProductController::class, 'store']);
Route::match(['put', 'post'], '/products/update.php', [ProductController::class, 'update']);
Route::delete('/products/delete.php', [ProductController::class, 'destroy']);

// Orders routes
Route::get('/orders/get.php', [BoatOrderController::class, 'index']);
Route::post('/orders/create.php', [BoatOrderController::class, 'store']);
Route::match(['put', 'post'], '/orders/update.php', [BoatOrderController::class, 'update']);
Route::delete('/orders/delete.php', [BoatOrderController::class, 'destroy']);

// Bookings routes
Route::get('/booking/get.php', [BookingController::class, 'index']);
Route::post('/booking/create.php', [BookingController::class, 'store']);
Route::match(['put', 'post'], '/booking/update.php', [BookingController::class, 'update']);
Route::delete('/booking/delete.php', [BookingController::class, 'destroy']);

// Owners routes
Route::get('/owners/get.php', [OwnerController::class, 'index']);
Route::post('/owners/create.php', [OwnerController::class, 'store']);
Route::match(['put', 'post'], '/owners/update.php', [OwnerController::class, 'update']);
Route::delete('/owners/delete.php', [OwnerController::class, 'destroy']);

// Payments routes
Route::get('/paymants/get.php', [PaymentController::class, 'index']);
Route::post('/paymants/create.php', [PaymentController::class, 'store']);
Route::match(['put', 'post'], '/paymants/update.php', [PaymentController::class, 'update']);
Route::delete('/paymants/delete.php', [PaymentController::class, 'destroy']);
