<?php

Route::inertia('/', 'welcome')->name('home');

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::inertia('/login', 'Login')->name('login');
    Route::inertia('/register', 'Register')->name('register');
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/doc', [DocController::class, 'index'])->name('Doc.index');
    Route::post('/docs', [DocController::class, 'store'])->name('Doc.store');
    Route::delete('/docs/{id}', [DocController::class, 'destroy'])->name('Doc.destroy');
});
