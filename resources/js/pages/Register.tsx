import { Link, useForm } from '@inertiajs/react';
import '../../css/app.css';
import AuthLayout from '../components/AuthLayout';
import { btnPrimary, inputCls } from '../components/ui';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({ name: '', email: '', password: '' });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        post('/register');
    }

    return (
        <AuthLayout title="Создать аккаунт" subtitle="Пара секунд, и можно редактировать вместе">
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Имя</label>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Как вас зовут" className={inputCls} />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="you@example.com" className={inputCls} />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Пароль</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Минимум 8 символов" className={inputCls} />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                <button type="submit" disabled={processing} className={btnPrimary + ' w-full !py-2.5'}>
                    {processing ? 'Создаём…' : 'Зарегистрироваться'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
                Уже есть аккаунт?{' '}
                <Link href="/login" className="font-medium text-[#5367e8] hover:underline">Войти</Link>
            </p>
        </AuthLayout>
    );
}
