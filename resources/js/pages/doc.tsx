import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useCollabText } from '../hooks/useCollabText';

type Props = {
    document: { id: number; title: string; content: string | null; version: number };
    role: 'owner' | 'editor' | 'commenter' | 'viewer';
    shared: { id: number; email: string; role: string }[];
};

const STATUS_LABEL = {
    saved: 'Все изменения сохранены',
    saving: 'Сохранение…',
    offline: 'Нет связи с сервером, пытаюсь восстановить…',
    error: 'Ошибка синхронизации — обновите страницу',
} as const;

export default function Doc({ document: doc, role, shared }: Props) {
    const [email, setEmail] = useState('');
    const [shareRole, setShareRole] = useState('viewer');
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const canEdit = role === 'owner' || role === 'editor';

    const { text, onChange, textareaRef, status } = useCollabText({
        docId: doc.id,
        initialText: doc.content ?? '',
        initialVersion: doc.version,
        canEdit,
    });

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
                ref={textareaRef}
                value={text}
                onChange={(e) => onChange(e.target.value)}
                readOnly={!canEdit || status === 'error'}
                rows={20}
                cols={80}
            />
            <p>{STATUS_LABEL[status]}</p>

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