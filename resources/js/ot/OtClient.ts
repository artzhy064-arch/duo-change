import { TextOperation } from './TextOperation';
import { transform } from './transform';

// Состояния: synchronized -> awaiting (одна операция в полёте) -> awaiting-with-buffer
// (в полёте одна, ещё одна копится в буфере). ack возвращает автомат назад.
export class OtClient {
    revision: number;                        // сколько серверных операций уже учтено
    outstanding: TextOperation | null = null; // отправлена, ack ещё не пришёл
    buffer: TextOperation | null = null;      // накоплено, пока ждём ack

    constructor(
        revision: number,
        private readonly send: (op: TextOperation, baseVersion: number) => void,
        private readonly applyRemote: (op: TextOperation) => void,
    ) {
        this.revision = revision;
    }

    get state(): 'synchronized' | 'awaiting' | 'awaiting-with-buffer' {
        if (!this.outstanding) return 'synchronized';
        return this.buffer ? 'awaiting-with-buffer' : 'awaiting';
    }

    // Пользователь что-то напечатал
    applyClient(op: TextOperation): void {
        if (!this.outstanding) {
            this.outstanding = op;
            this.send(op, this.revision);
        } else if (!this.buffer) {
            this.buffer = op;
        } else {
            this.buffer = this.buffer.compose(op);
        }
    }

    // Пришла чужая операция с версией revision + 1
    applyServer(op: TextOperation): void {
        this.revision++;
        if (!this.outstanding) {
            this.applyRemote(op);
            return;
        }
        // Переносим чужую операцию поверх своих неподтверждённых.
        // Первый аргумент — чужая (она раньше получила версию).
        const [afterOut, out2] = transform(op, this.outstanding);
        this.outstanding = out2;
        if (!this.buffer) {
            this.applyRemote(afterOut);
            return;
        }
        const [afterBuf, buf2] = transform(afterOut, this.buffer);
        this.buffer = buf2;
        this.applyRemote(afterBuf);
    }

    // Сервер подтвердил нашу операцию
    serverAck(): void {
        if (!this.outstanding) throw new Error('ack без отправленной операции');
        this.revision++;
        if (this.buffer) {
            this.outstanding = this.buffer; // буфер уходит на сервер следующим
            this.buffer = null;
            this.send(this.outstanding, this.revision);
        } else {
            this.outstanding = null;
        }
    }
}