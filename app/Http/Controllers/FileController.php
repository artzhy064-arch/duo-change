<?php

namespace App\Http\Controllers;

use App\Models\Doc;
use App\Services\SyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use App\Models\ActivityLog;

class FileController extends Controller
{
    // скачать документ как .md
    public function export(Doc $doc)
    {
        Gate::authorize('view', $doc);

        $name = Str::slug($doc->title) ?: 'document';

        return response()->streamDownload(function () use ($doc) {
            echo $doc->content ?? '';
        }, $name . '.md', ['Content-Type' => 'text/markdown; charset=UTF-8']);
    }

    // загрузить файл: создаём пустой документ и вставляем текст обычной операцией
    public function import(Request $request, SyncService $sync)
    {
        $request->validate([
            'file' => 'required|file|mimes:txt,md|max:200', // до 200 КБ
        ]);

        $file = $request->file('file');
        $text = file_get_contents($file->getRealPath());

        if (! mb_check_encoding($text, 'UTF-8')) { return back()->withErrors(['file' => 'Файл должен быть в UTF-8']); }

        $title = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $doc = $request->user()->docs()->create(['title' => $title]);
        ActivityLog::add('doc.import', $doc);

        if ($text !== '') $sync->submit($doc, $request->user(), 'import', 0, [$text]);
        return redirect('/docs/' . $doc->id);
    }
} ?>