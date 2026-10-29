import { useState } from "react";
import { Link, router, usePage } from '@inertiajs/react';
type Props = {
    document: { id: number, title: string, content: string | null };
    role: 'owner' | 'editor' | 'commenter' | 'viewer';
    shared: { id: number, email: string, role: string }[];
};
export default function Doc({ document, role, shared}: Props) {
    const [content, setContent] = useState(document.content ?? '');
    const canEdit = role === 'owner' || role === 'editor';
    function save() { 
        router.patch(`/docs/${document.id}`, { content });
    }
    const [email, setEmail] = useState('');
    const [shareRole, setShareRole] = useState('viewer');
    const {errors} = usePage<{ errors: Record<string, string> }>().props;

    function share() {
        router.post(`/docs/${document.id}/share`, { email, role: shareRole }, {
            preserveScroll: true,
            onSuccess: () => setEmail(''), 
        });
    }
    function changeRole(userId: number, newRole: string) {
        router.patch(`/docs/${document.id}/share/${userId}`, { role: newRole }, {
            preserveScroll: true
        });
    }
    function revoke(userId: number) {
        router.delete( `/docs/${document.id}/share/${userId}`, { preserveScroll: true });
    }

    return (
        <div>
            <Link href="/doc">← К списку</Link>
            <h1>{document.title}</h1>
            <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                readOnly={!canEdit}
                rows={20}
                cols={80}
                />
                {canEdit && <button onClick={save}>Сохранить</button>}
                {role === "owner" && (
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