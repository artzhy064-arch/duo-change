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


### Диаграммы duo-change

#### 1. Последовательность: два редактора одновременно вставляют текст

```mermaid
sequenceDiagram
    autonumber
    actor A as Редактор A (браузер)
    actor B as Редактор B (браузер)
    participant S as Laravel (OperationController + SyncService)
    participant DB as БД (documents, operations)
    participant WS as Reverb (WebSocket)

    Note over A,B: Оба видят документ "ab", версия 0

    par одновременный ввод
        A->>A: печатает X, локально "aXb"<br/>op = [1,"X",1]
        A->>S: POST /docs/1/ops {baseVersion:0, op:[1,"X",1]}
    and
        B->>B: печатает Y, локально "aYb"<br/>op = [1,"Y",1]
        B->>S: POST /docs/1/ops {baseVersion:0, op:[1,"Y",1]}
    end

    Note over S: Блокировка документа: запросы обрабатываются по очереди

    S->>S: проверка прав: Gate update (A)
    S->>DB: журнал после версии 0: пусто
    S->>DB: версия 1 = [1,"X",1], content = "aXb"
    S->>WS: событие doc.op {version:1, clientId:A, op:[1,"X",1]}

    S->>S: проверка прав: Gate update (B)
    S->>DB: журнал после версии 0: [1,"X",1]
    S->>S: transform(журнал, входящая)<br/>[1,"Y",1] становится [2,"Y",1]
    S->>DB: версия 2 = [2,"Y",1], content = "aXYb"
    S->>WS: событие doc.op {version:2, clientId:B, op:[2,"Y",1]}

    WS-->>A: версия 1 (своя операция): ack
    WS-->>B: версия 1 (чужая операция)
    Note over B: transform(пришедшая, локальная)<br/>"aYb" становится "aXYb"
    WS-->>A: версия 2 (чужая операция)
    Note over A: "aXb" становится "aXYb"
    WS-->>B: версия 2 (своя операция): ack

    Note over A,B: У обоих "aXYb", версия 2. Тексты сошлись.
```

#### 2. Состояния комментария

```mermaid
stateDiagram-v2
    [*] --> Open: создан
    Open --> Resolved: закрыть (владелец, редактор)
    Reopened --> Resolved: закрыть
    Resolved --> Reopened: открыть заново
```

#### 3. Use Case по ролям

```mermaid
flowchart LR
    V([Наблюдатель])
    C([Комментатор])
    E([Редактор])
    O([Владелец])
    AD([Администратор])

    subgraph Система["duo-change"]
        U1(Просмотр документа и истории)
        U2(Скачать документ .md)
        U3(Оставить комментарий и ответить в ветке)
        U4(Редактировать текст в реальном времени)
        U5(Закрыть и открыть заново комментарий)
        U6(Создать, удалить, импортировать документ)
        U7(Назначить роли доступа)
        U8(Откатить к версии)
        U9(Управлять квотами хранения)
        U10(Смотреть журнал активности)
    end

    V --> U1
    V --> U2
    C --> U1
    C --> U3
    E --> U1
    E --> U3
    E --> U4
    E --> U5
    O --> U1
    O --> U3
    O --> U4
    O --> U5
    O --> U6
    O --> U7
    O --> U8
    AD --> U9
    AD --> U10
```

#### 4. Диаграмма классов

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +bool is_admin
        +int storage_quota_kb
    }
    class Doc {
        +int id
        +string title
        +string content
        +int version
        +int owner_id
        +roleFor(User) string
    }
    class DocumentPermission {
        +int document_id
        +int user_id
        +string role
    }
    class Operation {
        +int id
        +int document_id
        +int user_id
        +string client_id
        +string type
        +json payload
        +int version
    }
    class Snapshot {
        +int document_id
        +int version
        +string content
    }
    class Comment {
        +int document_id
        +int author_id
        +int parent_id
        +int anchor_start
        +int anchor_end
        +string quote
        +string body
        +string status
        +datetime resolved_at
    }
    class ActivityLog {
        +int user_id
        +int document_id
        +string action
        +string details
    }
    class TextOperation {
        +retain(n)
        +insert(s)
        +delete(n)
        +apply(doc) string
        +diff(from, to)$ TextOperation
    }
    class OTTransformer {
        +transform(a, b) TextOperation[2]
    }
    class SyncService {
        +submit(doc, user, clientId, baseVersion, op) Operation
    }
    class HistoryService {
        +contentAt(doc, version) string
    }
    class DocPolicy {
        +view()
        +update()
        +comment()
        +resolve()
        +revert()
    }
    class OperationApplied {
        <<event, WebSocket>>
        +broadcastOn()
    }

    User "1" --> "*" Doc : владеет
    User "*" --> "*" Doc : доступ
    Doc "1" --> "*" DocumentPermission
    Doc "1" --> "*" Operation : журнал
    Doc "1" --> "*" Snapshot : каждые 50 версий
    Doc "1" --> "*" Comment
    Comment "1" --> "*" Comment : ответы
    User "1" --> "*" ActivityLog
    SyncService ..> OTTransformer
    SyncService ..> TextOperation
    SyncService ..> Operation : создаёт
    SyncService ..> OperationApplied : рассылает
    HistoryService ..> Snapshot
    HistoryService ..> Operation
    DocPolicy ..> Doc
```

## Автор
artzhy064-arch — 2026
