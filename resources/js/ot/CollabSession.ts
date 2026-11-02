import { OtClient } from './OtClient';
import { TextOperation } from './TextOperation';
import type { Component } from './TextOperation';

export type ServerMessage = { version: number; clientId: string | null; op: Component[] | null };
export type SyncStatus = 'saved' | 'saving' | 'offline' | 'error';
export type Handlers = {
    onRemoteText: (next: string, prev: string, op: TextOperation) => void;
    onStatus: (s: SyncStatus) => void;
};

const xsrf = () =>
    decodeURIComponent(
        document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? '',
    );

export class CollabSession {
    readonly clientId = crypto.randomUUID();
    text: string;
    isFailed = false;
    private client: OtClient;
    private future = new Map<number, ServerMessage>(); // сообщения, пришедшие не по порядку
    private handlers: Handlers | null = null;
    private fetching = false;

    constructor(private docId: number, text: string, version: number, private canEdit: boolean) {
        this.text = text;
        this.client = new OtClient(
            version,
            (op, base) => void this.transmit(op, base),
            (op) => {
                const prev = this.text;
                this.text = op.apply(prev);
                this.handlers?.onRemoteText(this.text, prev, op);
            },
        );
    }

    start(h: Handlers) { this.handlers = h; void this.catchUp(); }
    stop() { this.handlers = null; }

    localEdit(next: string) {
        if (!this.canEdit || this.isFailed) return;
        const op = TextOperation.diff(this.text, next);
        if (op.isNoop()) return;
        this.text = next;
        this.client.applyClient(op);
        this.status();
    }

    receive(m: ServerMessage) {
        if (this.isFailed || m.version <= this.client.revision) return;
        this.future.set(m.version, m);
        this.drain();
        if (this.future.size > 0) void this.catchUp(); // дыра в версиях — догружаем по HTTP
    }

    private drain() {
        try {
            for (;;) {
                const m = this.future.get(this.client.revision + 1);
                if (!m || m.op === null) return;
                this.future.delete(m.version);
                if (m.clientId === this.clientId) this.client.serverAck(); // своя = ack
                else this.client.applyServer(TextOperation.fromJSON(m.op));
                this.status();
            }
        } catch (e) { this.fail(e); }
    }

    private async transmit(op: TextOperation, baseVersion: number) {
        try {
            const res = await fetch(`/docs/${this.docId}/ops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf() },
                body: JSON.stringify({ clientId: this.clientId, baseVersion, op: op.toJSON() }),
            });
            if (!res.ok) this.fail(new Error(`HTTP ${res.status}`));
        } catch { this.handlers?.onStatus('offline'); }
    }

    async catchUp() {
        if (this.fetching || this.isFailed) return;
        this.fetching = true;
        try {
            const res = await fetch(`/docs/${this.docId}/ops?since=${this.client.revision}`, {
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = (await res.json()) as { ops: ServerMessage[] };
            for (const m of data.ops) if (m.version > this.client.revision) this.future.set(m.version, m);
            this.drain();
            this.status();
        } catch { this.handlers?.onStatus('offline'); }
        finally { this.fetching = false; }
    }

    private status() {
        if (!this.isFailed) this.handlers?.onStatus(this.client.state === 'synchronized' ? 'saved' : 'saving');
    }
    private fail(e: unknown) {
        console.error('[collab]', e);
        this.isFailed = true;
        this.handlers?.onStatus('error');
    }
}