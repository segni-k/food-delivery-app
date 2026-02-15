<?php

use App\Enums\UserRoleEnum;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DeliveryController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\PromoCodeController;
use App\Http\Controllers\Api\V1\RestaurantController;
use App\Http\Controllers\Api\V1\ReviewController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('payments/webhook/chapa', [PaymentController::class, 'chapaWebhook']);
    Route::get('restaurants', [RestaurantController::class, 'index']);
    Route::get('restaurants/{restaurant}', [RestaurantController::class, 'show']);
    Route::get('menu-items', [MenuController::class, 'index']);
    Route::get('menu-items/{menuItem}', [MenuController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('profile', [ProfileController::class, 'me']);
        Route::patch('profile', [ProfileController::class, 'update']);
        Route::post('profile/addresses', [ProfileController::class, 'storeAddress']);
        Route::delete('profile/addresses/{address}', [ProfileController::class, 'deleteAddress']);
        Route::post('profile/payment-cards', [ProfileController::class, 'storePaymentCard']);
        Route::delete('profile/payment-cards/{card}', [ProfileController::class, 'deletePaymentCard']);

        Route::middleware('role:' . UserRoleEnum::RESTAURANT_OWNER->value . ',' . UserRoleEnum::ADMIN->value)->group(function (): void {
            Route::post('restaurants', [RestaurantController::class, 'store']);
            Route::patch('restaurants/{restaurant}', [RestaurantController::class, 'update']);
            Route::get('restaurants/{restaurant}/categories', [MenuController::class, 'indexCategories']);
            Route::post('restaurants/{restaurant}/categories', [MenuController::class, 'storeCategory']);
            Route::patch('restaurants/{restaurant}/categories/{category}', [MenuController::class, 'updateCategory']);
            Route::delete('restaurants/{restaurant}/categories/{category}', [MenuController::class, 'destroyCategory']);
            Route::get('restaurants/{restaurant}/items', [MenuController::class, 'indexItems']);
            Route::post('restaurants/{restaurant}/items', [MenuController::class, 'storeItem']);
            Route::patch('restaurants/{restaurant}/items/{item}', [MenuController::class, 'updateItem']);
            Route::delete('restaurants/{restaurant}/items/{item}', [MenuController::class, 'destroyItem']);
            Route::patch('restaurants/{restaurant}/items/{item}/availability', [MenuController::class, 'toggleItemAvailability']);
            Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
            Route::post('orders/{order}/assign-delivery-partner', [DeliveryController::class, 'assignPartner']);
            Route::get('delivery-partners', [DeliveryController::class, 'listPartners']);
        });

        Route::middleware('role:' . UserRoleEnum::CUSTOMER->value)->group(function (): void {
            Route::post('orders', [OrderController::class, 'store']);
            Route::post('promos/apply', [PromoCodeController::class, 'apply']);
            Route::post('promo-codes/validate', [PromoCodeController::class, 'validateCode']);
            Route::post('reviews', [ReviewController::class, 'store']);
            Route::post('payments/intents', [PaymentController::class, 'createIntent']);
            Route::post('payments', [PaymentController::class, 'store']);
            Route::post('delivery-zones/validate', [DeliveryController::class, 'validateZone']);
        });

        Route::middleware('role:' . UserRoleEnum::DELIVERY_PARTNER->value)->group(function (): void {
            Route::post('delivery-assignments/{assignment}/accept', [DeliveryController::class, 'accept']);
            Route::post('delivery-assignments/{assignment}/reject', [DeliveryController::class, 'reject']);
            Route::get('my-deliveries', [DeliveryController::class, 'myDeliveries']);
            Route::post('orders/{order}/assign', [DeliveryController::class, 'respondToAssignment']);
            Route::patch('orders/{order}/delivery-status', [DeliveryController::class, 'updateDeliveryStatus']);
        });

        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::post('payments/{payment}/verify', [PaymentController::class, 'verify']);
    });
});
