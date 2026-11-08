import { echo } from '@laravel/echo-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TextOperation } from '../ot/TextOperation';

export type Member = { id: number; name: string };
export type Cursor = { start: number; end: number }; // позиции в символах

export function usePresence(docId: number, me: Member) {
    const [members, setMembers] = useState<Member[]>([]);
    const [cursors, setCursors] = useState<Record<number, Cursor>>({});
    const channel = useRef<any>(null);
    const last = useRef(0);

    useEffect(() => {
        const ch: any = echo().join(`document-presence.${docId}`);
        channel.current = ch;

        ch.here((m: Member[]) => setMembers(m))
            .joining((m: Member) => setMembers((p) => [...p.filter((x) => x.id !== m.id), m]))
            .leaving((m: Member) => {
                setMembers((p) => p.filter((x) => x.id !== m.id));
                setCursors((c) => {
                    const n = { ...c };
                    delete n[m.id];
                    return n;
                });
            })
            .listenForWhisper('cursor', (e: { id: number } & Cursor) =>
                setCursors((c) => ({ ...c, [e.id]: { start: e.start, end: e.end } })),
            );

        return () => {
            echo().leave(`document-presence.${docId}`);
            channel.current = null;
        };
    }, [docId]);

    // отправить свой курсор, не чаще раза в 80 мс
    const sendCursor = useCallback(
        (start: number, end: number) => {
            const now = Date.now();
            if (now - last.current < 80) return;
            last.current = now;
            channel.current?.whisper('cursor', { id: me.id, start, end });
        },
        [me.id],
    );

    // любая правка текста сдвигает чужие курсоры
    const shiftCursors = useCallback((op: TextOperation) => {
        setCursors((c) => {
            const n: Record<number, Cursor> = {};
            for (const [id, cur] of Object.entries(c)) {
                n[Number(id)] = {
                    start: op.transformIndex(cur.start),
                    end: op.transformIndex(cur.end),
                };
            }
            return n;
        });
    }, []);

    return { members, cursors, sendCursor, shiftCursors };
}