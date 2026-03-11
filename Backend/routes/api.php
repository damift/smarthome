<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomsController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\RoutineController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\DeviceAccessController;
use App\Models\History;


Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::get('/user', [AuthController::class, 'user']);

Route::middleware('auth:sanctum')
    ->delete('/users/{id}', [AuthController::class, 'deleteUser']);

Route::get('/rooms', [RoomsController::class, 'index']);

// Device API endpoints
Route::prefix('devices')->group(function () {
    Route::get('/', [DeviceController::class, 'index']);
    Route::post('/', [DeviceController::class, 'store']);
    Route::get('/{id}', [DeviceController::class, 'show']);
    Route::put('/{id}', [DeviceController::class, 'update']);
    Route::delete('/{id}', [DeviceController::class, 'destroy']);
    Route::post('/{id}/toggle', [DeviceController::class, 'toggleStatus']);
});

// Type API endpoints (clean RESTful)
Route::apiResource('types', TypeController::class);

// endpoint to update user role 
Route::middleware('auth:sanctum')
    ->put('/users/{id}/role', [AuthController::class, 'updateRole']);
Route::post('/users/{id}/password', [AuthController::class, 'updatePassword'])->middleware('auth:sanctum');

Route::post('/devices/{device}/execute', [DeviceController::class, 'execute'])->middleware('auth:sanctum');
Route::get('/device-access', [DeviceAccessController::class, 'index'])->middleware('auth:sanctum');
Route::put('/device-access/{userId}', [DeviceAccessController::class, 'update'])->middleware('auth:sanctum');

    // routes/api.php
Route::get('/logs', [HistoryController::class, 'index']);

Route::get('/routines', [RoutineController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/routines/{routine}/activate', [RoutineController::class, 'activate']);
});
