import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

type U = { id: number; name: string; email: string; is_admin: boolean; storage_quota_kb: number; used_kb: number };
type L = { id: number; action: string; details: string | null; created_at: string; user: { name: string } | null };

export default function Admin({ users, logs }: { users: U[]; logs: L[] }) {
    // новые значения квот, пока не сохранены
    const [quota, setQuota] = useState<Record<number, string>>({});

    function save(id: number) {
        router.patch(`/admin/users/${id}/quota`, { storage_quota_kb: Number(quota[id]) }, { preserveScroll: true });
    }

    return (
        <div>
            <Link href="/doc">← К списку</Link>
            <h1>Администрирование</h1>

            <h2>Пользователи</h2>
            <table>
                <thead>
                    <tr><th>Имя</th><th>Email</th><th>Занято, КБ</th><th>Квота, КБ</th><th></th></tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.name}{u.is_admin && ' (админ)'}</td>
                            <td>{u.email}</td>
                            <td>{u.used_kb}</td>
                            <td>
                                <input
                                    type="number"
                                    value={quota[u.id] ?? u.storage_quota_kb}
                                    onChange={(e) => setQuota({ ...quota, [u.id]: e.target.value })}
                                />
                            </td>
                            <td><button onClick={() => save(u.id)}>Сохранить</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Журнал активности</h2>
            <ul>
                {logs.map((l) => (
                    <li key={l.id}>
                        {new Date(l.created_at).toLocaleString()} · {l.user?.name ?? '—'} · {l.action}
                        {l.details && ` · ${l.details}`}
                    </li>
                ))}
            </ul>
        </div>
    );
}