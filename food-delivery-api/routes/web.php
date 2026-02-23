<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => config('app.name', 'Food Delivery API'),
        'status' => 'ok',
        'api_base' => url('/api/v1'),
        'health' => url('/health'),
    ]);
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});
