<?php

namespace App\Services;

use App\Models\Doc;
use App\Models\Operation;
use App\Models\Snapshot;
use App\Ot\OtException;
use App\Ot\TextOperation;

class HistoryService {
    public function ContentAt(Doc $doc, int $version): string {
        if ($version < 0 || $version > $doc->version) {
            throw new OtException('Такой версии нет.');
        }
        
        //Ближайший снапшот не новее нужной версии.
        $snap = Snapshot::where('document_id', $doc->id)->where('version', '<=', $version)->orderByDesc('version')->first();
        
        $text = $snap ? $snap->content : '';
        $from = $snap ? $snap->version : 0;
        
        //Операции после снапшота до нужной версии.
        $ops = Operation::where('document_id', $doc->id)->where('version', '>', $from)
            ->where('version', '<=', $version)->orderBy('version')->get();
        
        foreach ($ops as $op) {
            $text = TextOperation::fromArray($op->payload)->apply($text);
        }
        return $text;
    }
}