<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OperationsController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $users = request()->user()?->role->value === 'coo'
        ? User::query()->orderBy('id')->get(['id', 'email', 'role', 'active'])
        : [];

    $operations = request()->user()
        ? app(OperationsController::class)->allData()
        : ['clients' => [], 'tasks' => [], 'cycles' => [], 'feedback' => []];

    return Inertia::render('PbmOps', ['users' => $users, 'operations' => $operations]);
})->name('home');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('guest')->name('login');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth')->name('logout');
Route::middleware('auth')->group(function () {
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::get('/operations', [OperationsController::class, 'index']);
    Route::post('/clients', [OperationsController::class, 'storeClient']);
    Route::put('/clients/{client}', [OperationsController::class, 'updateClient']);
    Route::delete('/clients/{client}', [OperationsController::class, 'destroyClient']);
    Route::post('/tasks', [OperationsController::class, 'storeTask']);
    Route::put('/tasks/{task}', [OperationsController::class, 'updateTask']);
    Route::delete('/tasks/{task}', [OperationsController::class, 'destroyTask']);
    Route::post('/cycles', [OperationsController::class, 'storeCycle']);
    Route::put('/cycles/{cycle}', [OperationsController::class, 'updateCycle']);
    Route::delete('/cycles/{cycle}', [OperationsController::class, 'destroyCycle']);
    Route::post('/feedback', [OperationsController::class, 'storeFeedback']);
    Route::put('/feedback/{feedback}', [OperationsController::class, 'updateFeedback']);
    Route::patch('/feedback/{feedback}/action', [OperationsController::class, 'updateFeedbackAction']);
    Route::delete('/feedback/{feedback}', [OperationsController::class, 'destroyFeedback']);
});
