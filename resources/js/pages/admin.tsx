import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { btnSmall, card, inputCls } from '../components/ui';

type U = { id: number; name: string; email: string; is_admin: boolean; storage_quota_kb: number; used_kb: number };
type L = { id: number; action: string; details: string | null; created_at: string; user: { name: string } | null };

// цвет значка по типу действия в журнале
const badge = (action: string) =>
    action.startsWith('doc.delete') ? 'bg-red-100 text-red-700'
    : action.startsWith('doc.revert') ? 'bg-amber-100 text-amber-700'
    : action.startsWith('comment') ? 'bg-sky-100 text-sky-700'
    : action.startsWith('admin') ? 'bg-violet-100 text-violet-700'
    : 'bg-emerald-100 text-emerald-700';

export default function Admin({ users, logs }: { users: U[]; logs: L[] }) {
    const [quota, setQuota] = useState<Record<number, string>>({});

    function save(id: number) {
        router.patch(`/admin/users/${id}/quota`, { storage_quota_kb: Number(quota[id]) }, { preserveScroll: true });
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-[#20283b]">
            <header className="border-b border-[#e8ebf2] bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5367e8] text-xs font-bold text-white">dC</span>
                        <h1 className="text-lg font-semibold">Администрирование</h1>
                    </div>
                    <Link href="/doc" className="text-sm text-slate-500 hover:text-[#5367e8]">← К документам</Link>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-8 p-6">
                <section>
                    <h2 className="mb-3 text-base font-semibold">Пользователи и квоты</h2>
                    <div className={`${card} overflow-x-auto`}>
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Пользователь</th>
                                    <th className="px-4 py-3">Занято</th>
                                    <th className="px-4 py-3">Квота, КБ</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u) => {
                                    const pct = u.storage_quota_kb ? Math.min(100, Math.round((u.used_kb / u.storage_quota_kb) * 100)) : 100;
                                    return (
                                        <tr key={u.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {u.name}
                                                    {u.is_admin && <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] text-violet-700">админ</span>}
                                                </div>
                                                <div className="text-xs text-slate-400">{u.email}</div>
                                            </td>
                                            <td className="w-56 px-4 py-3">
                                                <div className="mb-1 text-xs text-slate-500">{u.used_kb} КБ · {pct}%</div>
                                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                    <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : 'bg-[#5367e8]'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </td>
                                            <td className="w-40 px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={quota[u.id] ?? u.storage_quota_kb}
                                                    onChange={(e) => setQuota({ ...quota, [u.id]: e.target.value })}
                                                    className={inputCls + ' !py-1.5'}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => save(u.id)} className={btnSmall}>Сохранить</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-base font-semibold">Журнал активности</h2>
                    <div className={`${card} divide-y divide-slate-100`}>
                        {logs.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Событий пока нет</p>}
                        {logs.map((l) => (
                            <div key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                                <span className="w-40 shrink-0 text-xs text-slate-400">{new Date(l.created_at).toLocaleString()}</span>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge(l.action)}`}>{l.action}</span>
                                <span className="font-medium">{l.user?.name ?? '—'}</span>
                                {l.details && <span className="text-slate-500">{l.details}</span>}
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
