# duoChange

Система совместного редактирования документов в реальном времени.
Учебный проект, вариант 2. <одна-две фразы своими словами>



![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)




![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)




![Inertia](https://img.shields.io/badge/Inertia.js-9553E9)




![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)



## Возможности
- [x] Регистрация и вход (сессии)
- [x] Документы с владельцем
- [ ] Роли: владелец, редактор, комментатор, наблюдатель, админ
- [ ] Совместное редактирование (WebSocket, OT)
- [ ] История версий и откат
- [ ] Комментарии

## Стек
Laravel 13, Inertia.js, React, Tailwind CSS, SQLite, Laravel Reverb (планируется)

## Запуск
```bash
git clone <ссылка на репозиторий>
cd collab-docs
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
composer run dev
```
Приложение: http://localhost:8000

## Структура
- `app/Http/Controllers` — контроллеры
- `app/Models` — модели (User, Doc)
- `resources/js/pages` — страницы React
- `database/migrations` — схема БД

## Автор
artzhy064-arch — 2026
