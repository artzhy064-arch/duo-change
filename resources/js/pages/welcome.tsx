import { Head, Link } from '@inertiajs/react';
import '../../css/app.css';

const features = [
    { t: 'Правки в реальном времени', d: 'Несколько человек печатают одновременно, тексты всегда сходятся (Operational Transformation).' },
    { t: 'История и откат', d: 'Снапшоты и журнал операций: смотрите любую версию и возвращайтесь к ней.' },
    { t: 'Роли и комментарии', d: 'Владелец, редактор, комментатор, наблюдатель. Ветки обсуждений со статусами.' },
    { t: 'Курсоры коллег', d: 'Видно, кто сейчас в документе и где находится его курсор.' },
];

export default function Welcome() {
    return (
        <>
            <Head title="duoChange" />
            <div className="min-h-screen bg-gradient-to-br from-[#f5f7fb] via-white to-[#edf0ff] text-[#20283b]">
                <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
                    <span className="flex items-center gap-2 text-lg font-bold">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5367e8] text-sm text-white">dC</span>
                        duoChange<span className="text-[#5367e8]">.</span>
                    </span>
                    <nav className="flex items-center gap-3 text-sm">
                        <Link href="/login" className="text-slate-600 hover:text-[#5367e8]">Войти</Link>
                        <Link href="/register" className="rounded-lg bg-[#5367e8] px-4 py-2 font-medium text-white shadow-sm hover:opacity-90">Начать</Link>
                    </nav>
                </header>

                <main className="mx-auto max-w-5xl px-6 pb-20 pt-16 text-center">
                    <span className="inline-block rounded-full bg-[#edf0ff] px-3 py-1 text-xs font-semibold text-[#5367e8]">
                        Совместное редактирование документов
                    </span>
                    <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-bold leading-tight tracking-tight">
                        Создавайте вместе. <span className="text-[#5367e8]">Меняйте свободно.</span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">
                        Мини-аналог Google Docs: общий текст в реальном времени, история версий, комментарии и разграничение прав.
                    </p>
                    <div className="mt-8 flex justify-center gap-3">
                        <Link href="/register" className="rounded-xl bg-[#5367e8] px-6 py-3 font-medium text-white shadow-md hover:opacity-90">Создать аккаунт</Link>
                        <Link href="/login" className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50">Войти</Link>
                    </div>

                    <div className="mt-16 grid gap-4 text-left sm:grid-cols-2">
                        {features.map((f) => (
                            <div key={f.t} className="rounded-2xl border border-[#e8ebf2] bg-white p-5 shadow-[0_8px_25px_rgba(35,48,85,0.04)]">
                                <h3 className="font-semibold">{f.t}</h3>
                                <p className="mt-1 text-sm text-slate-500">{f.d}</p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
