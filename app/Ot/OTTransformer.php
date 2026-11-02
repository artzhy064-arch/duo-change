<?php

namespace App\Ot;

final class OTTransformer
{
    /** transform(a, b) -> [a', b'] для операций, созданных на одном и том же тексте */
    public function transform(TextOperation $a, TextOperation $b): array
    {
        if ($a->baseLength() !== $b->baseLength()) {
            throw new OtException('Операции начинаются с разных документов.');
        }
        $a2 = new TextOperation;
        $b2 = new TextOperation;
        $A = $a->ops();
        $B = $b->ops();
        $i = 0;
        $j = 0;
        $ca = $A[$i++] ?? null;   // текущий компонент a
        $cb = $B[$j++] ?? null;   // текущий компонент b

        while ($ca !== null || $cb !== null) {
            // Вставка из a: a' её сохраняет, b' "перешагивает" её через retain
            if (is_string($ca)) {
                $a2->insert($ca);
                $b2->retain(TextOperation::length($ca));
                $ca = $A[$i++] ?? null;
                continue;
            } 
            if (is_string($cb)) {
                $a2->retain(TextOperation::length($cb));
                $b2->insert($cb);
                $cb = $B[$j++] ?? null;
                continue;
            }

            // Дальше оба компонента — числа
            if ($ca > 0 && $cb > 0) {            // retain / retain
                $min = min($ca, $cb);
                $a2->retain($min);
                $b2->retain($min);
            } elseif ($ca < 0 && $cb < 0) {      // delete / delete
                $min = min(-$ca, -$cb);          // оба удаляют одно и то же, писать ничего не надо
            } elseif ($ca < 0) {                 // delete / retain
                $min = min(-$ca, $cb);
                $a2->delete($min);
            } else {                             // retain / delete
                $min = min($ca, -$cb);
                $b2->delete($min);
            }

            // Уменьшаем обе компоненты на $min (знак сохраняется)
            $na = $ca > 0 ? $ca - $min : $ca + $min;
            $nb = $cb > 0 ? $cb - $min : $cb + $min;
            $ca = $na === 0 ? ($A[$i++] ?? null) : $na;
            $cb = $nb === 0 ? ($B[$j++] ?? null) : $nb;
        }

        return [$a2, $b2];
    }
}