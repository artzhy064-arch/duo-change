import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

// Общая рамка для входа и регистрации: логотип и карточка по центру
export default function AuthLayout({ title, subtitle, children }: {
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f7fb] via-white to-[#edf0ff] p-6">
            <div className="w-full max-w-md">
                <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-[#20283b]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5367e8] text-sm text-white shadow-md">dC</span>
                    duoChange<span className="text-[#5367e8]">.</span>
                </Link>
                <div className="rounded-2xl border border-[#e8ebf2] bg-white p-8 shadow-[0_8px_25px_rgba(35,48,85,0.06)]">
                    <h1 className="text-2xl font-semibold text-[#20283b]">{title}</h1>
                    <p className="mb-6 mt-1 text-sm text-[#8490a5]">{subtitle}</p>
                    {children}
                </div>
            </div>
        </div>
    );
}
