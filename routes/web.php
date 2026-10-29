<?php

Route::inertia('/', 'welcome')->name('home');

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocController;
use App\Http\Controllers\PermissionController;
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
    Route::delete('/docs/{doc}', [DocController::class, 'destroy'])->name('Doc.destroy');
    Route::get('/docs/{doc}', [DocController::class, 'show'])->name('Doc.show');
    Route::patch('/docs/{doc}', [DocController::class, 'update'])->name('Doc.update');
    Route::post('/docs/{doc}/share', [PermissionController::class, 'store']);
    Route::patch('/docs/{doc}/share/{user}', [PermissionController::class, 'update']);
    Route::delete('/docs/{doc}/share/{user}', [PermissionController::class, 'destroy']);
});
