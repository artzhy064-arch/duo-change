import {useForm } from '@inertiajs/react';
import '../../css/app.css';
export default function Register() {
    const {data, setData, post, processing, errors} = useForm({
        name: '',
        email: '',
        password: '',
    });
    function sumbit(event: React.FormEvent) {
        event.preventDefault();
        post('register');
    }
    return (
        <form onSubmit={sumbit}>
            <h1>Вход</h1>
            <input type="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder='Name' />
            {errors.name && <div>{errors.name}</div>}
            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder='Email' />
            {errors.email && <div>{errors.email}</div>}
            <input type="password" name="password" onChange={(e) => setData('password', e.target.value)} placeholder='Password' />
            {errors.password && <div>{errors.password}</div>}
            <button type="submit" disabled={processing}>Войти</button>
            <a href="/login">Вход</a>
        </form>
    );
}