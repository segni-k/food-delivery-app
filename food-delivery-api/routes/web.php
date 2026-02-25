<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

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

Route::get('/neon', function () {
    try {
        $result = DB::select('select version()');
        $dbVersion = $result[0]->version ?? 'Unknown PostgreSQL version';
    } catch (\Throwable $exception) {
        $dbVersion = 'Error: Could not connect to the database. '.$exception->getMessage();
    }

    return view('neon', ['db_version' => $dbVersion]);
});
