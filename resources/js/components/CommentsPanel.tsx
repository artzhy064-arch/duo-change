import { useEffect, useState } from 'react';
import { btnPrimary, btnSmall, inputCls } from './ui';

type Author = { name: string };
type Reply = { id: number; body: string; author: Author };
type Thread = {
    id: number;
    body: string;
    status: 'open' | 'resolved' | 'reopened';
    quote: string | null;
    author: Author;
    replies: Reply[];
};
export type Selection = { start: number; end: number; quote: string } | null;

function xsrf() {
    const raw = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1];
    return decodeURIComponent(raw ?? '');
}

async function api(url: string, method = 'GET', body?: object) {
    const res = await fetch(url, {
        method,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrf() },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

const STATUS = {
    open: { label: 'Открыт', cls: 'bg-emerald-100 text-emerald-700' },
    resolved: { label: 'Закрыт', cls: 'bg-slate-200 text-slate-600' },
    reopened: { label: 'Открыт заново', cls: 'bg-amber-100 text-amber-700' },
};

const initials = (name: string) => name.trim().slice(0, 1).toUpperCase();

export default function CommentsPanel({ docId, role, selection }: {
    docId: number;
    role: string;
    selection: Selection;
}) {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [text, setText] = useState('');
    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [error, setError] = useState('');

    const canComment = ['owner', 'editor', 'commenter'].includes(role);
    const canResolve = ['owner', 'editor'].includes(role);
    const base = `/docs/${docId}/comments`;

    async function load() {
        try {
            setThreads(await api(base));
        } catch {
            setError('Не удалось загрузить комментарии');
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function run(fn: () => Promise<unknown>) {
        setError('');
        try {
            await fn();
            await load();
        } catch {
            setError('Действие не удалось (возможно, нет прав)');
        }
    }

    function addComment() {
        if (!text.trim()) return;
        run(async () => {
            await api(base, 'POST', {
                body: text,
                anchor_start: selection?.start,
                anchor_end: selection?.end,
                quote: selection?.quote,
            });
            setText('');
        });
    }

    function addReply(parentId: number) {
        const body = replyText[parentId];
        if (!body?.trim()) return;
        run(async () => {
            await api(base, 'POST', { body, parent_id: parentId });
            setReplyText({ ...replyText, [parentId]: '' });
        });
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Веток: {threads.length}</span>
                <button onClick={load} className={btnSmall}>Обновить</button>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            {canComment && (
                <div className="space-y-2 rounded-xl bg-slate-50 p-3">
                    {selection && (
                        <p className="border-l-4 border-indigo-300 pl-2 text-xs text-slate-500">
                            К фрагменту: «{selection.quote.slice(0, 80)}»
                        </p>
                    )}
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addComment()}
                        placeholder={selection ? 'Комментарий к выделенному…' : 'Общий комментарий…'}
                        className={inputCls}
                    />
                    <button onClick={addComment} className={btnPrimary + ' w-full'}>Отправить</button>
                </div>
            )}

            {threads.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Комментариев пока нет</p>}

            {threads.map((t) => (
                <div key={t.id} className={`rounded-xl border p-3 text-sm ${t.status === 'resolved' ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200 bg-white'}`}>
                    {t.quote && (
                        <blockquote className="mb-2 border-l-4 border-indigo-300 pl-2 text-xs text-slate-500">
                            {t.quote}
                        </blockquote>
                    )}
                    <div className="flex items-start gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {initials(t.author.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <b className="text-slate-800">{t.author.name}</b>
                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS[t.status].cls}`}>
                                    {STATUS[t.status].label}
                                </span>
                            </div>
                            <p className="mt-0.5 break-words text-slate-700">{t.body}</p>
                        </div>
                    </div>

                    {t.replies.length > 0 && (
                        <ul className="mt-2 space-y-1.5 border-l-2 border-slate-100 pl-3">
                            {t.replies.map((r) => (
                                <li key={r.id} className="text-slate-600">
                                    <b className="text-slate-700">{r.author.name}</b>: {r.body}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                        {canComment && (
                            <>
                                <input
                                    value={replyText[t.id] ?? ''}
                                    onChange={(e) => setReplyText({ ...replyText, [t.id]: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && addReply(t.id)}
                                    placeholder="Ответить…"
                                    className={inputCls + ' !py-1.5'}
                                />
                                <button onClick={() => addReply(t.id)} className={btnSmall}>OK</button>
                            </>
                        )}
                        {canResolve && t.status !== 'resolved' && (
                            <button onClick={() => run(() => api(`${base}/${t.id}/resolve`, 'POST'))} className={btnSmall}>Закрыть</button>
                        )}
                        {canResolve && t.status === 'resolved' && (
                            <button onClick={() => run(() => api(`${base}/${t.id}/reopen`, 'POST'))} className={btnSmall}>Открыть</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
