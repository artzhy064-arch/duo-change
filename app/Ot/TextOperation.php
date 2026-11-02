<?php

namespace App\Ot;

final class TextOperation
{
    private array $ops = [];
    private int $baseLength = 0;    // длина документа, на который рассчитана операция
    private int $targetLength = 0;  // длина после применения

    public static function length(string $s): int
    {
        return mb_strlen($s, 'UTF-8');
    }

    public function retain(int $n): self
    {
        if ($n === 0) return $this;
        $this->baseLength += $n;
        $this->targetLength += $n;
        $last = $this->ops[count($this->ops) - 1] ?? null;
        if (is_int($last) && $last > 0) {
            $this->ops[count($this->ops) - 1] = $last + $n;   // склеиваем соседние
        } else {
            $this->ops[] = $n;
        }
        return $this;
    }

    public function delete(int $n): self
    {
        if ($n === 0) return $this;
        $len = abs($n);
        $this->baseLength += $len;
        $last = $this->ops[count($this->ops) - 1] ?? null;
        if (is_int($last) && $last < 0) {
            $this->ops[count($this->ops) - 1] = $last - $len;
        } else {
            $this->ops[] = -$len;
        }
        return $this;
    }

    public function insert(string $s): self {
        if ($s === '') return $this;
        $this->targetLength += self::length($s);

        $n = count($this->ops);
        $last = $this->ops[$n - 1] ?? null;
        if (is_string($last)) {
        $this->ops[$n - 1] = $last . $s;
        } else {
            $this->ops[] = $s;
        }
        return $this;
    }   

    public function ops(): array { return $this->ops; }
    public function baseLength(): int { return $this->baseLength; }
    public function targetLength(): int { return $this->targetLength; }

    public static function fromArray(array $raw): self
    {
        $op = new self;
        foreach ($raw as $c) {
            if (is_string($c)) {
                $op->insert($c);
            } elseif (is_int($c) && $c > 0) {
                $op->retain($c);
            } elseif (is_int($c) && $c < 0) {
                $op->delete($c);
            } else {
                throw new OtException('Некорректный компонент операции.');
            }
        }
        return $op;
    }

    public function apply(string $doc): string
    {
        $chars = mb_str_split($doc, 1, 'UTF-8');
        if (count($chars) !== $this->baseLength) {
            throw new OtException('Длина документа не совпадает с операцией.');
        }
        $pos = 0;
        $out = '';
        foreach ($this->ops as $c) {
            if (is_string($c)) {
                $out .= $c;                                         // вставка
            } elseif ($c > 0) {
                $out .= implode('', array_slice($chars, $pos, $c)); // оставить $c символов
                $pos += $c;
            } else {
                $pos += -$c;                                        // удалить: просто пропускаем
            }
        }
        return $out;
    }
}