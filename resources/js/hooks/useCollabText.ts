import { useEcho } from '@laravel/echo-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CollabSession } from '../ot/CollabSession';
import type { ServerMessage, SyncStatus } from '../ot/CollabSession';

const toCp = (s: string, i: number) => Array.from(s.slice(0, i)).length;
const toUtf16 = (s: string, cp: number) => Array.from(s).slice(0, cp).join('').length;

export function useCollabText(p: { docId: number; initialText: string; initialVersion: number; canEdit: boolean }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const sel = useRef<[number, number] | null>(null);
    const [text, setText] = useState(p.initialText);
    const [status, setStatus] = useState<SyncStatus>('saved');
    const [session] = useState(() => new CollabSession(p.docId, p.initialText, p.initialVersion, p.canEdit));

    useEffect(() => {
        session.start({
            onStatus: setStatus,
            onRemoteText: (next, prev, op) => {
                const el = textareaRef.current;
                if (el && window.document.activeElement === el) { // сдвигаем курсор
                    sel.current = [
                        toUtf16(next, op.transformIndex(toCp(prev, el.selectionStart))),
                        toUtf16(next, op.transformIndex(toCp(prev, el.selectionEnd))),
                    ];
                }
                setText(next);
            },
        });
        return () => session.stop();
    }, [session]);

    useEcho(`document.${p.docId}`, '.doc.op', (m: ServerMessage) => session.receive(m));

    useLayoutEffect(() => {
        if (sel.current && textareaRef.current) textareaRef.current.setSelectionRange(...sel.current);
        sel.current = null;
    }, [text]);

    function onChange(value: string) {
        if (!p.canEdit || session.isFailed) return;
        setText(value);
        session.localEdit(value);
    }
    return { text, onChange, textareaRef, status };
}