<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomsController;

Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

    Route::get('/user', [AuthController::class, 'user']);
    Route::delete('/user', [AuthController::class, 'deleteUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/test', [TestController::class, 'hello']);

Route::get('/rooms', [RoomsController::class, 'index']);


