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


<iframe src="https://mermaid.live/embed?theme=dark&look=classic&mode=dark#pako:eNqdVt1u0zAUfhXL4qId2QRI3FRTpYkJgYS0SRsgQVDlJm5rmtjBPumIpklbd7kr3mRC6_iZGK-QvBF2m7AmcVpGelOf38_nnO8kx9gTPsUd7AVEqV1GhpKErnQ50s9chl4rKtFxITPPQ8YBMb8kUiAZHyJOQmqT05CwoKToCxEgpnrEDxmvRVcgJBnS3qdYAOmN-4XBSRnbrvD-GRowCKzYPMGBcqiFmVCpmKhjE0ecyl4liRQBfS5ky1SrjRaRm0HHoU64T2XIlElhuYOfG1XzGF2s6vnzuxgYDWn3IioJ2LNZkvwnAC9gFqeiBUlU7sBHpeFEJAkE8dfVv3KdA04iNRJwz9rZmmqfg0q-ZyI0Me-ZjsQwEtKmiYhs8uGe8VFAJDQpKbcW2NDFOuN94Sc2uU4CsSppfAIUWEiRpEoEE-r3SFNNdjxgEwbJKzG01MU2JavqlUMiHjQ0yKegt4hqAHNIP0PTjEvjyVu8XQGjEUJLlaU-DSjQqi2JoiBpaehVci982GDQGkgROghE-0EZSxMfDw8l4WogZFhbsFBoWsRB_XY53vsnH5o4kXDvgMoJ82gloIr7IQOD35n3xcmJ-tLX8Ymibxa0cJCI2mgd8hfMrOfEniln0U6eLOfb-pW4LwLmJZVgE0aPWuVGxJEZ0IrQW5CzIs0HuCadmK63163JHd1xRv0you1t7c3BQW9p_0B4Ywrdbvm1JvUq84iCPV5JURzm71MXP3Yx2tzs6n8b-p95kXVQ-jW9SS_Tq3SWzrJpxWHD5nCV3mZn2TQ7T38X5kZjCV955ayyvmORznCdnWen6S8N62aVz991rF1-auPr9Cq7SGfo6SNzq1l2mp2l39Mfq0LkG7YwKRZug5lJdJtN58Gn2cXK6i7tqcJumSpbW90yG5uMrLSuRVqqnr70bfpNd-ky-3LX0EaPYuS046l2OdO_i_lELE1DhXzGv6j9CpMa6jvGGbU-YQcPJfNxB2RMHayroD_Z9BEfuxhGVH_W4Y6LfSLHLnZcHAgxnkvmrGGei090hIjwd0KERRAp4uEIdwYkUPq0YG7-jbkwOfkDl2NrPA" width="100%" height="480" style="border:0" loading="lazy" title="Mermaid diagram" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>

## Автор
artzhy064-arch — 2026
