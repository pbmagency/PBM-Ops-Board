<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OperationsController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\TeamPerformanceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', DashboardController::class)->name('home');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('guest')->name('login');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth')->name('logout');
Route::middleware('auth')->group(function () {
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::put('/role-permissions/{role}', [RolePermissionController::class, 'update'])->name('role-permissions.update');

    Route::post('/clients', [OperationsController::class, 'storeClient'])->name('clients.store');
    Route::put('/clients/{client}', [OperationsController::class, 'updateClient'])->name('clients.update');
    Route::delete('/clients/{client}', [OperationsController::class, 'destroyClient'])->name('clients.destroy');
    Route::post('/tasks', [OperationsController::class, 'storeTask'])->name('tasks.store');
    Route::put('/tasks/{task}', [OperationsController::class, 'updateTask'])->name('tasks.update');
    Route::patch('/tasks/{task}/status', [OperationsController::class, 'updateTaskStatus'])->name('tasks.status');
    Route::delete('/tasks/{task}', [OperationsController::class, 'destroyTask'])->name('tasks.destroy');
    Route::post('/cycles', [OperationsController::class, 'storeCycle'])->name('cycles.store');
    Route::put('/cycles/{cycle}', [OperationsController::class, 'updateCycle'])->name('cycles.update');
    Route::delete('/cycles/{cycle}', [OperationsController::class, 'destroyCycle'])->name('cycles.destroy');
    Route::post('/feedback', [OperationsController::class, 'storeFeedback'])->name('feedback.store');
    Route::put('/feedback/{feedback}', [OperationsController::class, 'updateFeedback'])->name('feedback.update');
    Route::patch('/feedback/{feedback}/action', [OperationsController::class, 'updateFeedbackAction'])->name('feedback.action');
    Route::delete('/feedback/{feedback}', [OperationsController::class, 'destroyFeedback'])->name('feedback.destroy');

    Route::post('/team-reports', [TeamPerformanceController::class, 'storeReport'])->name('team-reports.store');
    Route::post('/team-kpi-definitions', [TeamPerformanceController::class, 'storeDefinition'])->name('team-kpi-definitions.store');
    Route::put('/team-kpi-definitions/{definition}', [TeamPerformanceController::class, 'updateDefinition'])->name('team-kpi-definitions.update');
    Route::delete('/team-kpi-definitions/{definition}', [TeamPerformanceController::class, 'destroyDefinition'])->name('team-kpi-definitions.destroy');
});
