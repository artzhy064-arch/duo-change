import { useEffect, useState } from 'react';

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
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': xsrf(),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

const STATUS = { open: 'открыт', resolved: 'закрыт', reopened: 'открыт заново' };

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

    // действие + перезагрузка списка
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
        <div>
            <h2>Комментарии</h2>
            <button onClick={load}>Обновить</button>
            {error && <p>{error}</p>}

            {canComment && (
                <div>
                    {selection && <p>К фрагменту: «{selection.quote}»</p>}
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={selection ? 'Комментарий к выделенному' : 'Общий комментарий'}
                    />
                    <button onClick={addComment}>Отправить</button>
                </div>
            )}

            {threads.map((t) => (
                <div key={t.id} style={{ border: '1px solid #ccc', margin: '8px 0', padding: 8 }}>
                    {t.quote && <blockquote>{t.quote}</blockquote>}
                    <b>{t.author.name}</b> [{STATUS[t.status]}]: {t.body}

                    {canResolve && t.status !== 'resolved' && (
                        <button onClick={() => run(() => api(`${base}/${t.id}/resolve`, 'POST'))}>Закрыть</button>
                    )}
                    {canResolve && t.status === 'resolved' && (
                        <button onClick={() => run(() => api(`${base}/${t.id}/reopen`, 'POST'))}>Открыть заново</button>
                    )}

                    <ul>
                        {t.replies.map((r) => (
                            <li key={r.id}>
                                <b>{r.author.name}</b>: {r.body}
                            </li>
                        ))}
                    </ul>

                    {canComment && (
                        <div>
                            <input
                                value={replyText[t.id] ?? ''}
                                onChange={(e) => setReplyText({ ...replyText, [t.id]: e.target.value })}
                                placeholder="Ответить"
                            />
                            <button onClick={() => addReply(t.id)}>Ответить</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}