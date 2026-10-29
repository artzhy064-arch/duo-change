import { useState } from "react";
import { Link, router } from '@inertiajs/react';
type Props = {
    document: { id: number, title: string, content: string | null };
    role: 'owner' | 'editor' | 'commenter' | 'viewer';
};
export default function Doc({ document, role}: Props) {
    const [content, setContent] = useState(document.content ?? '');
    const canEdit = role === 'owner' || role === 'editor';
    function save() { 
        router.patch(`/docs/${document.id}`, { content });
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
        </div>
    );
}