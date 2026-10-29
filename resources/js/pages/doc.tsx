import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';

type Props = {
    document: { id: number; title: string; content: string | null };
    role: 'owner' | 'editor' | 'commenter' | 'viewer';
    shared: { id: number; email: string; role: string }[];
};

export default function Doc({ document: doc, role, shared }: Props) {
    const [content, setContent] = useState(doc.content ?? '');
    const [clientId] = useState(() => crypto.randomUUID());
    const [email, setEmail] = useState('');
    const [shareRole, setShareRole] = useState('viewer');
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const canEdit = role === 'owner' || role === 'editor';

    useEcho(`document.${doc.id}`, '.doc.edited', (e: { content: string; clientId: string }) => {
        if (e.clientId !== clientId) setContent(e.content);
    });

    function onType(value: string) {
        console.log('typing', value);
        setContent(value);
        const token = decodeURIComponent(
            document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? ''
        );
        fetch(`/docs/${doc.id}/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-XSRF-TOKEN': token,
            },
            body: JSON.stringify({ content: value, clientId }),
        });
    }

    function save() {
        router.patch(`/docs/${doc.id}`, { content });
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
            <h1>{doc.title}</h1>
            <textarea
                value={content}
                onChange={(e) => onType(e.target.value)}
                readOnly={!canEdit}
                rows={20}
                cols={80}
            />
            {canEdit && <button onClick={save}>Сохранить</button>}

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