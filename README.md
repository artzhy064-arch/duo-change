# duoChange

Система совместного редактирования документов в реальном времени.



![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)




![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)




![Inertia](https://img.shields.io/badge/Inertia.js-9553E9)




![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)



## Возможности
- [x] Регистрация и вход (сессии)
- [x] Документы с владельцем
- [x] Роли: владелец, редактор, комментатор, наблюдатель, админ
- [x] Совместное редактирование (WebSocket, OT)
- [x] История версий и откат
- [x] Комментарии

## Стек
Laravel 13, Inertia.js, React, Tailwind CSS, SQLite, Laravel Reverb (планируется)

## Запуск
```bash
git clone https://github.com/artzhy064-arch/duo-change
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
