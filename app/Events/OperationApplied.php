<?php

namespace App\Events;

use App\Models\Operation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

// Рассылается ВСЕМ в канале, включая автора: для автора это подтверждение (ack)
class OperationApplied implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public Operation $operation) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('document.'.$this->operation->document_id)];
    }

    public function broadcastAs(): string
    {
        return 'doc.op';
    }

    public function broadcastWith(): array
    {
        $payload = $this->operation->payload;
        // Reverb режет сообщения больше 10 КБ: большую операцию клиент догрузит сам по HTTP
        $tooBig = strlen((string) json_encode($payload)) > 6000;

        return [
            'version' => $this->operation->version,
            'clientId' => $this->operation->client_id,
            'userId' => $this->operation->user_id,
            'op' => $tooBig ? null : $payload,
        ];
    }
}