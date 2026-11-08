<?php

namespace App\Http\Controllers;

use App\Models\Doc;
use App\Models\Operation;
use App\Ot\TextOperation;
use App\Services\HistoryService;
use App\Services\SyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\ActivityLog;

class HistoryController extends Controller
{
    //Список версий (видят все, у кого естт доступ к документу).
    public function index(Doc $doc) {
        gate::authorize('view', $doc);
        $versions = Operation::where('document_id', $doc->id)->orderByDesc('version')->limit(200)->get(['version', 'user_id', 'created_at']);
        return response()->json($versions);
    }

    //Текст документа на версии $version
    public function show(Doc $doc, int $version, HistoryService $history) {
        gate::authorize('view', $doc);

        return responce()->json([
            'version' => $version,
            'content' => $history->contentAt($doc, $version),
        ]);
    }
    
    public function revert(Request $request, Doc $doc, int $version, HistoryService $history, SyncService $sync) {
        gate::authorize('revert', $doc);

        $target = $history->contentAt($doc, $version);
        $op = TextOperation::diff($doc->content ?? '', $target);

        if ($target === ($doc->content ?? '')) {
            return responce()->json(['version' => $doc->version]);
            ActivityLog::add('doc.revert', $doc, 'на версию ' . $version);
        }

        $new = $sync->submit($doc, $request->user(), 'revert', $doc->version, $op->ops());

        return responce()->json(['version' => $new->version]);
    }
}
