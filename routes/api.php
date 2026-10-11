<?php

use App\Http\Controllers\Api\CentralizedAnalyticsApiController;
use Illuminate\Support\Facades\Route;

Route::post('/analytics/batch', [CentralizedAnalyticsApiController::class, 'receiveBatch'])
    ->name('api.analytics.batch');

Route::get('/analytics/status', [CentralizedAnalyticsApiController::class, 'status'])
    ->name('api.analytics.status');
