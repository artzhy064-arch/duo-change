<?php

Route::inertia('/', 'welcome')->name('home');

use App\Http\Controllers\OperationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\CommentController;
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
    // Route::post('/docs/{doc}/edit', [DocController::class, 'edit']);
    Route::post('/docs/{doc}/ops', [OperationController::class, 'store']);
    Route::get('/docs/{doc}/ops', [OperationController::class, 'index']);
    Route::get('/docs/{doc}/history', [HistoryController::class, 'index']);
    Route::get('/docs/{doc}/history/{version}', [HistoryController::class, 'show']);
    Route::post('/docs/{doc}/revert/{version}', [HistoryController::class, 'revert']);
    Route::post('/docs/import', [FileController::class, 'import']);
    Route::get('/docs/{doc}/export', [FileController::class, 'export']);
    Route::get('/docs/{doc}/comments', [CommentController::class, 'index']);
    Route::post('/docs/{doc}/comments', [CommentController::class, 'store']);
    Route::post('/docs/{doc}/comments/{comment}/resolve', [CommentController::class, 'resolve']);
    Route::post('/docs/{doc}/comments/{comment}/reopen', [CommentController::class, 'reopen']);
});
