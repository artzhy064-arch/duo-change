import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CommentsPanel from '../components/CommentsPanel';
import type { Selection } from '../components/CommentsPanel';
import RemoteCursors, { colorOf } from '../components/RemoteCursors';
import { btnDanger, btnGhost, btnPrimary, btnSmall, card, inputCls } from '../components/ui';
import { useCollabText } from '../hooks/useCollabText';
import { usePresence } from '../hooks/usePresence';

type Props = {
    document: { id: number; title: string; content: string | null; version: number };
    role: 'owner' | 'editor' | 'commenter' | 'viewer';
    shared: { id: number; email: string; role: string }[];
    me: { id: number; name: string };
};

const STATUS = {
    saved: { label: 'Сохранено', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    saving: { label: 'Сохранение…', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700' },
    offline: { label: 'Нет связи, восстанавливаю…', dot: 'bg-orange-500 animate-pulse', text: 'text-orange-700' },
    error: { label: 'Ошибка синхронизации, обновите страницу', dot: 'bg-red-500', text: 'text-red-700' },
} as const;

const ROLE_LABEL: Record<string, string> = {
    owner: 'Владелец',
    editor: 'Редактор',
    commenter: 'Комментатор',
    viewer: 'Наблюдатель',
};

type Tab = 'comments' | 'history' | 'access';

function xsrf() {
    const raw = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1];
    return decodeURIComponent(raw ?? '');
}

export default function Doc({ document: doc, role, shared, me }: Props) {
    const [tab, setTab] = useState<Tab>('comments');
    const [email, setEmail] = useState('');
    const [shareRole, setShareRole] = useState('viewer');
    const [selection, setSelection] = useState<Selection>(null);
    const [versions, setVersions] = useState<{ version: number; created_at: string }[]>([]);
    const [preview, setPreview] = useState<{ version: number; content: string } | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const canEdit = role === 'owner' || role === 'editor';

    const { members, cursors, sendCursor, shiftCursors } = usePresence(doc.id, me);
    const { text, onChange, textareaRef, status } = useCollabText({
        docId: doc.id,
        initialText: doc.content ?? '',
        initialVersion: doc.version,
        canEdit,
        onOp: shiftCursors,
    });

    // один и тот же стиль у поля ввода и слоя с чужими курсорами, иначе они разъедутся
    const boxStyle: React.CSSProperties = {
        width: '100%',
        height: 'calc(100vh - 230px)',
        minHeight: 420,
        padding: 20,
        boxSizing: 'border-box',
        font: '15px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        margin: 0,
        borderRadius: 16,
    };

    function reportCursor(t: HTMLTextAreaElement) {
        const cp = (i: number) => Array.from(t.value.slice(0, i)).length;
        sendCursor(cp(t.selectionStart), cp(t.selectionEnd));
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
        await fetch(`/docs/${doc.id}/revert/${v}`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf() },
        });
        setPreview(null);
        loadHistory();
    }

    function share() {
        router.post(`/docs/${doc.id}/share`, { email, role: shareRole }, { preserveScroll: true, onSuccess: () => setEmail('') });
    }
    function changeRole(userId: number, newRole: string) {
        router.patch(`/docs/${doc.id}/share/${userId}`, { role: newRole }, { preserveScroll: true });
    }
    function revoke(userId: number) {
        router.delete(`/docs/${doc.id}/share/${userId}`, { preserveScroll: true });
    }

    const st = STATUS[status];
    const tabs: { id: Tab; label: string }[] = [
        { id: 'comments', label: 'Комментарии' },
        { id: 'history', label: 'История' },
        ...(role === 'owner' ? [{ id: 'access' as Tab, label: 'Доступ' }] : []),
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
                    <div className="flex min-w-0 items-center gap-4">
                        <Link href="/doc" className="text-sm text-slate-500 transition hover:text-indigo-600">← Документы</Link>
                        <h1 className="truncate text-lg font-semibold">{doc.title}</h1>
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {ROLE_LABEL[role]}
                        </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                        <span className={`flex items-center gap-2 text-sm ${st.text}`}>
                            <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                            {st.label}
                        </span>
                        <a href={`/docs/${doc.id}/export`} className={btnGhost}>Скачать .md</a>
                    </div>
                </div>
            </header>

            <main className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section>
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-slate-500">Сейчас в документе:</span>
                        {members.map((m) => (
                            <span
                                key={m.id}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-slate-200"
                            >
                                <span className="h-2 w-2 rounded-full" style={{ background: colorOf(m.id) }} />
                                {m.name}
                                {m.id === me.id && <span className="text-slate-400">(вы)</span>}
                            </span>
                        ))}
                        {!canEdit && (
                            <span className="ml-auto rounded-full bg-slate-200 px-2.5 py-0.5 text-xs text-slate-600">Только чтение</span>
                        )}
                    </div>

                    <div className={`${card} relative p-0`}>
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
                            placeholder={canEdit ? 'Начните печатать…' : ''}
                            className="block resize-none bg-transparent text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            style={{ ...boxStyle, overflowY: 'scroll' }}
                        />
                        <RemoteCursors text={text} cursors={cursors} members={members} scrollTop={scrollTop} boxStyle={boxStyle} />
                    </div>
                </section>

                <aside className={`${card} flex h-fit flex-col overflow-hidden`}>
                    <div className="flex border-b border-slate-200 bg-slate-50 p-1.5">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTab(t.id);
                                    if (t.id === 'history') loadHistory();
                                }}
                                className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                    tab === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="max-h-[calc(100vh-230px)] overflow-y-auto p-4">
                        {tab === 'comments' && <CommentsPanel docId={doc.id} role={role} selection={selection} />}

                        {tab === 'history' && (
                            <div className="space-y-3">
                                <button onClick={loadHistory} className={btnSmall}>Обновить</button>
                                {versions.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Правок пока нет</p>}
                                <ul className="space-y-1.5">
                                    {versions.map((v) => (
                                        <li key={v.version} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                                            <div>
                                                <span className="font-semibold text-slate-700">v{v.version}</span>
                                                <span className="ml-2 text-xs text-slate-400">{new Date(v.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => showVersion(v.version)} className={btnSmall}>Показать</button>
                                                {role === 'owner' && (
                                                    <button onClick={() => revert(v.version)} className={btnDanger}>Откатить</button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {preview && (
                                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3">
                                        <div className="mb-1 flex items-center justify-between text-xs font-medium text-indigo-700">
                                            Версия {preview.version}
                                            <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                                        </div>
                                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-slate-700">
                                            {preview.content || '(пусто)'}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'access' && role === 'owner' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email пользователя" className={inputCls} />
                                    <div className="flex gap-2">
                                        <select value={shareRole} onChange={(e) => setShareRole(e.target.value)} className={inputCls}>
                                            <option value="viewer">Наблюдатель</option>
                                            <option value="commenter">Комментатор</option>
                                            <option value="editor">Редактор</option>
                                        </select>
                                        <button onClick={share} className={btnPrimary}>Выдать</button>
                                    </div>
                                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                </div>
                                <ul className="space-y-2">
                                    {shared.length === 0 && <li className="text-center text-sm text-slate-400">Доступ пока ни у кого нет</li>}
                                    {shared.map((u) => (
                                        <li key={u.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                                            <span className="min-w-0 flex-1 truncate">{u.email}</span>
                                            <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs">
                                                <option value="viewer">Наблюдатель</option>
                                                <option value="commenter">Комментатор</option>
                                                <option value="editor">Редактор</option>
                                            </select>
                                            <button onClick={() => revoke(u.id)} className={btnDanger}>✕</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
}
