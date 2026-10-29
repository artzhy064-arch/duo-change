<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class DocEdited implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $docId,
        public string $content,
        public string $clientId,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('document.' . $this->docId)];
    }

    public function broadcastAs(): string
    {
        return 'doc.edited';
    }
}