<?php

namespace App\Http\Controllers;

use App\Models\Doc;
use App\Models\Operation;
use App\Services\SyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class OperationController extends Controller
{
    // Принять правку. Подтверждением служит рассылка по WebSocket, а не этот ответ
    public function store(Request $request, Doc $doc, SyncService $sync): JsonResponse
    {
        Gate::authorize('update', $doc); // право редактировать проверяется на КАЖДУЮ операцию
        $data = $request->validate([
            'clientId' => 'required|string|max:64',
            'baseVersion' => 'required|integer|min:0',
            'op' => 'required|array|min:1|max:5000',
        ]);

        $operation = $sync->submit($doc, $request->user(), $data['clientId'], (int) $data['baseVersion'], $data['op']);

        return response()->json(['version' => $operation->version]);
    }

    // Догрузка пропущенных операций: разрыв связи, большая операция, первая синхронизация
    public function index(Request $request, Doc $doc): JsonResponse
    {
        Gate::authorize('view', $doc); // читать могут и наблюдатели
        $since = max(0, (int) $request->query('since', 0));

        $ops = Operation::query()
            ->where('document_id', $doc->id)
            ->where('version', '>', $since)
            ->orderBy('version')
            ->limit(500)
            ->get();

        return response()->json([
            'version' => (int) Doc::query()->whereKey($doc->id)->value('version'),
            'ops' => $ops->map(fn (Operation $o) => [
                'version' => $o->version,
                'clientId' => $o->client_id,
                'userId' => $o->user_id,
                'op' => $o->payload,
            ])->all(),
        ]);
    }
}