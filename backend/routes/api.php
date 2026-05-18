<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TradeController;
use App\Http\Controllers\Api\CategoryController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
    
Route::controller(AuthController::class)->group(function () {
    Route::post('/register', 'register');
    Route::post('/login', 'login');
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/password', [AuthController::class, 'updatePassword']);
    Route::post('/user/address', [AuthController::class, 'updateAddress']);
    Route::delete('/products/images/{imageId}', [ProductController::class, 'deleteImage']);

    Route::get('/user', fn (Request $request) => $request->user());
    
    Route::get('/my-products', function (Request $request) {
        // Kullanıcının sadece kendi ürünlerini ve yayında (status=1) olanları getirir
        return $request->user()->products()->where('status', 1)->get();
    });
   


    Route::controller(ProductController::class)->group(function () {
      
      
        Route::prefix('products')->group(function () {
            Route::post('/', 'store');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');          
            Route::post('/{id}/favorite', 'toggleFavorite'); 
            
            // Admin Özel: Ürün Onaylama
            Route::middleware(\App\Http\Middleware\IsAdmin::class)
                ->post('/{id}/approve', 'approve');       // POST /products/{id}/approve
        });

        // Kullanıcıya Özel Ürün Listeleri
        Route::get('/user/products', 'myProducts');       // GET /user/products
        Route::get('/favorites', 'favorites');            // GET /favorites
    });

    
    Route::controller(TradeController::class)->prefix('trades')->group(function () {
        Route::get('/', 'index');                         // GET /trades
        Route::post('/', 'store');                        // POST /trades
        Route::post('/{id}/accept', 'accept');            // POST /trades/{id}/accept
    });

});