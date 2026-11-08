import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useCollabText } from '../hooks/useCollabText';
import { usePresence } from '../hooks/usePresence';
import RemoteCursors, { colorOf } from '../components/RemoteCursors';
import CommentsPanel from '../components/CommentsPanel';
import type { Selection } from '../components/CommentsPanel';

type Props = {
    document: { id: number; title: string; content: string | null; version: number };
    role: 'owner' | 'editor' | 'commenter' | 'viewer';
    shared: { id: number; email: string; role: string }[];
    me: { id: number; name: string };
};

const STATUS_LABEL = {
    saved: 'Все изменения сохранены',
    saving: 'Сохранение…',
    offline: 'Нет связи с сервером, пытаюсь восстановить…',
    error: 'Ошибка синхронизации — обновите страницу',
} as const;

export default function Doc({ document: doc, role, shared, me }: Props) {
    const [email, setEmail] = useState('');
    const [shareRole, setShareRole] = useState('viewer');
    const [versions, setVersions] = useState<{ version: number; created_at: string}[]>([]);
    const [preview, setPreview] = useState<{version: number; content: string} | null>(null);
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const canEdit = role === 'owner' || role === 'editor';
    const { members, cursors, sendCursor, shiftCursors } = usePresence(doc.id, me);
    const [scrollTop, setScrollTop] = useState(0);
    const boxStyle: React.CSSProperties = {
        width: 640,
        height: 360,
        padding: 8,
        border: '1px solid #888',
        boxSizing: 'border-box',
        font: '14px/1.5 monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        margin: 0,
    };
    function reportCursor(t: HTMLTextAreaElement) {
        const cp = (i: number) => Array.from(t.value.slice(0, i)).length;
        sendCursor(cp(t.selectionStart), cp(t.selectionEnd));
    }
    const { text, onChange, textareaRef, status } = useCollabText({docId: doc.id, initialText: doc.content ?? '', initialVersion: doc.version, canEdit, onOp: shiftCursors,});
    const [selection, setSelection] = useState<Selection>(null);

    function xsrf() {
        const raw = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1];
        return decodeURIComponent(raw ?? '');
    }
    async function loadHistory() {
        const res = await fetch(`/docs/${doc.id}/history`, { headers: { Accept: 'application/json' } });
        setVersions(await res.json());
    }
    async function showVersion(v: number) {
        const res = await fetch(`/docs/${doc.id}/history/${v}`, { headers: { Accept: 'application/json' } });
        setPreview(await res.json());
    }
    async function revert(v: number) {
        if (!confirm(`Откатить документ к версии ${v}?`)) return;
        await fetch(`/docs/${doc.id}/revert/${v}`, {method: 'POST', headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf() }});
        setPreview(null);
    }
    function share() {
        router.post(`/docs/${doc.id}/share`, { email, role: shareRole }, {
            preserveScroll: true,
            onSuccess: () => setEmail(''),
        });
    }
    function changeRole(userId: number, newRole: string) {
        router.patch(`/docs/${doc.id}/share/${userId}`, { role: newRole }, { preserveScroll: true });
    }
    function revoke(userId: number) {
        router.delete(`/docs/${doc.id}/share/${userId}`, { preserveScroll: true });
    }

    return (
        <div>
            <Link href="/doc">← К списку</Link>
            <h1>
                <label> {doc.title}&#9;</label>
                <a href={`/docs/${doc.id}/export`}>Скачать .md</a>
            </h1>
            <p>Сейчас в документе:{' '} {members.map((m) => (<span key={m.id} style={{ color: colorOf(m.id), marginRight: 8 }}>● {m.name}</span>))}</p>
<           div style={{ position: 'relative', width: 640 }}>
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => {
                        onChange(e.target.value);
                        reportCursor(e.currentTarget);
                    }}
                    onKeyUp={(e) => reportCursor(e.currentTarget)}
                    onClick={(e) => reportCursor(e.currentTarget)}
                    onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                    onSelect={(e) => {
                        const t = e.currentTarget;
                        reportCursor(t);
                        if (t.selectionEnd > t.selectionStart) {
                            setSelection({
                                start: t.selectionStart,
                                end: t.selectionEnd,
                                quote: t.value.slice(t.selectionStart, t.selectionEnd).slice(0, 500),
                            });
                        }
                    }}
                    readOnly={!canEdit || status === 'error'}
                    style={{ ...boxStyle, display: 'block', resize: 'none', overflowY: 'scroll' }}
                />
                <RemoteCursors text={text} cursors={cursors} members={members} scrollTop={scrollTop} boxStyle={boxStyle} />
            </div>
            <p>{STATUS_LABEL[status]}</p>
            <button onClick={loadHistory}>История версий</button>
            {versions.length > 0 && (
                <ul>
                    {versions.map((v) => (
                        <li key={v.version}>
                            v{v.version} · {new Date(v.created_at).toLocaleString()}
                            <button onClick={() => showVersion(v.version)}>Посмотреть</button>
                            {role === 'owner' && <button onClick={()=>revert(v.version)}>Откатить</button>}
                        </li>
                    ))}
                </ul>
            )}
            {preview && (
                <div>
                    <h3>Версия {preview.version}</h3>
                    <pre>{preview.content}</pre>
                </div>
            )}
            <CommentsPanel docId={doc.id} role={role} selection={selection} />
            {role === 'owner' && (
                <div>
                    <h2>Доступ</h2>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
                    <select value={shareRole} onChange={(e) => setShareRole(e.target.value)}>
                        <option value="viewer">viewer</option>
                        <option value="commenter">commenter</option>
                        <option value="editor">editor</option>
                    </select>
                    <button onClick={share}>Поделиться</button>
                    {errors.email && <p>{errors.email}</p>}
                    <ul>
                        {shared.map((u) => (
                            <li key={u.id}>
                                {u.email}
                                <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                                    <option value="viewer">viewer</option>
                                    <option value="commenter">commenter</option>
                                    <option value="editor">editor</option>
                                </select>
                                <button onClick={() => revoke(u.id)}>Отозвать</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
