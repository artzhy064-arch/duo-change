import { Link, useForm } from '@inertiajs/react';
import '../../css/app.css';
import AuthLayout from '../components/AuthLayout';
import { btnPrimary, inputCls } from '../components/ui';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        post('/login');
    }

    return (
        <AuthLayout title="С возвращением" subtitle="Войдите, чтобы продолжить работу с документами">
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="you@example.com" className={inputCls} />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Пароль</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="••••••••" className={inputCls} />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                <button type="submit" disabled={processing} className={btnPrimary + ' w-full !py-2.5'}>
                    {processing ? 'Входим…' : 'Войти'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
                Нет аккаунта?{' '}
                <Link href="/register" className="font-medium text-[#5367e8] hover:underline">Зарегистрироваться</Link>
            </p>
        </AuthLayout>
    );
}
