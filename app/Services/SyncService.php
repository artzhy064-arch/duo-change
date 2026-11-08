<?php

namespace App\Services;

use App\Models\Doc;
use App\Models\Operation;
use App\Models\User;
use App\Models\Snapshot;
use App\Ot\OtException;
use App\Ot\OTTransformer;
use App\Ot\TextOperation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SyncService
{
    public function __construct(private readonly OTTransformer $transformer) {}

    /**
     * Принять операцию клиента, созданную на версии $baseVersion.
     * Вернуть сохранённую операцию (уже с номером версии).
     */
    public function submit(Doc $doc, User $author, string $clientId, int $baseVersion, array $rawOp): Operation
    {
        // Превращаем сырой массив из JSON в объект (заодно проверяем формат)
        $incoming = TextOperation::fromArray($rawOp);

        // Блокировка: пока одна правка обрабатывается, остальные ждут (до 5 секунд).
        // Так версии выдаются строго по очереди.
        return Cache::lock("doc-ot:{$doc->id}", 10)->block(5, function () use ($doc, $author, $clientId, $baseVersion, $incoming) {

            // Транзакция: либо записалось всё (журнал + документ), либо ничего
            $operation = DB::transaction(function () use ($doc, $author, $clientId, $baseVersion, $incoming) {

                // Перечитываем документ из БД, чтобы видеть актуальную версию и текст
                $fresh = Doc::query()->lockForUpdate()->findOrFail($doc->id);

                // Клиент не может опираться на версию, которой ещё нет
                if ($baseVersion < 0 || $baseVersion > $fresh->version) {
                    throw new OtException('Неизвестная базовая версия документа.');
                }

                // Все операции, которые сервер применил ПОСЛЕ версии клиента
                $history = Operation::query()
                    ->where('document_id', $fresh->id)
                    ->where('version', '>', $baseVersion)
                    ->orderBy('version')
                    ->get();

                // Переносим операцию клиента поверх каждой из них по очереди.
                // Первым аргументом идёт операция из журнала: она раньше получила версию,
                // поэтому при вставке в одну позицию её текст оказывается левее.
                // [, $incoming] — берём только второй результат, первый нам не нужен.
                foreach ($history as $past) {
                    [, $incoming] = $this->transformer->transform(
                        TextOperation::fromArray($past->payload),
                        $incoming
                    );
                }

                // Применяем к текущему тексту (если длина не совпадёт, будет OtException)
                $newContent = $incoming->apply($fresh->content ?? '');
                
                // квота владельца: блокируем только правки, которые увеличивают текст
                $owner = $fresh->owner;
                $grows = strlen($newContent) > strlen($fresh->content ?? '');
                $used = Doc::where('owner_id', $owner->id)->where('id', '!=', $fresh->id)->sum(DB::raw('length(content)')) + strlen($newContent);
                if ($grows && $used > $owner->storage_quota_kb * 1024) {
                    throw new OtException('Превышена квота хранения владельца документа.');
                }
                $version = $fresh->version + 1;

                // Пишем в журнал уже ПЕРЕНЕСЁННУЮ операцию
                $operation = Operation::create([
                    'document_id' => $fresh->id,
                    'user_id' => $author->id,
                    'client_id' => $clientId,
                    'payload' => $incoming->ops(),
                    'version' => $version,
                ]);

                // Обновляем сам документ: новый текст и номер версии
                $fresh->forceFill(['content' => $newContent, 'version' => $version])->save();
                if ($version % 50 === 0) {
                    Snapshot::create(['document_id' => $fresh->id, 'version' => $version, 'content' => $newContent]);
                }
                return $operation;
            });
            event(new \App\Events\OperationApplied($operation));
            return $operation;
        });
    }
}