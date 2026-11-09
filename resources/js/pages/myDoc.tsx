import { useEffect, useState } from 'react';
import '../../css/app.css';
import { Link, router, usePage } from '@inertiajs/react';


type Theme = 'light' | 'dark' | 'mixed';

type DocumentItem = {
    id: number;
    title: string;
    updated_at: string;
    is_owner: boolean;
    role: string;
    owner_name: string;
    preview: string;
};

type MyDocProps = {
    documents: DocumentItem[];
    storage: { used_kb: number; quota_kb: number };
};

const ROLE_LABEL: Record<string, string> = {
    owner: 'Владелец',
    editor: 'Редактор',
    commenter: 'Комментатор',
    viewer: 'Наблюдатель',
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function MyDoc({ documents = [], storage }: MyDocProps) {
    const [theme, setTheme] = useState<Theme>('mixed');
    const [search, setSearch] = useState('');
    const { auth } = usePage<{ auth: { user: { name: string; is_admin?: boolean } } }>().props;
    const [section, setSection] = useState('all');
    const [showThemes, setShowThemes] = useState(false);
    const [newTitle, setNewTitle] = useState('');
useEffect(() => {
    const savedTheme = localStorage.getItem('mydocs-theme') as Theme | null;

    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'mixed') {
        setTheme(savedTheme);
    }
}, []);

useEffect(() => {
    document.documentElement.dataset.mydocsTheme = theme;
    localStorage.setItem('mydocs-theme', theme);
}, [theme]);

function createDocument() {
    const title = newTitle;
    if (!newTitle?.trim()) return;

    router.post( '/docs' , {title: title.trim() }, { onSuccess: () => setNewTitle('') });
}
function deleteDocument(id: number) {
    if (!confirm('Удалить документ?')) return;
    router.delete(`/docs/${id}`);
}

// function toggleFavorite(id: number) {
//     setDocs((previous) =>
//         previous.map((item) =>
//             item.id === id ? { ...item, favorite: !item.favorite } : item
//         )
//     );
// }

// документы приходят отсортированными по свежести
const mine = documents.filter((d) => d.is_owner);
const sharedWithMe = documents.filter((d) => !d.is_owner);
const list = section === 'shared' ? sharedWithMe : section === 'recent' ? documents.slice(0, 6) : mine;
const filteredDocuments = list.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));
const usedPct = storage.quota_kb ? Math.min(100, Math.round((storage.used_kb / storage.quota_kb) * 100)) : 100;

const themeNames: Record<Theme, string> = {
    light: 'Светлая',
    dark: 'Тёмная',
    mixed: 'Комбинированная',
};

return (
    <div className="mydocs-app">
        <aside className="sidebar">
            <a className="brand" href="/doc">
                <span className="brand-icon">dC</span>
                <span>duoChange<span className="brand-dot">.</span></span>
            </a>

            <button className="create-button" onClick={createDocument}>
                <span>＋</span> Создать документ
            </button>
            <br />
            <input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder='Название документа'></input>
            <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>

            <nav className="main-nav">
                <button className={section === 'all' ? 'nav-item active' : 'nav-item'} onClick={() => setSection('all')}>
                    <span className="nav-icon">▦</span> Мои документы
                    <span className="nav-count">{documents.length}</span>
                </button>
                <button className={section === 'recent' ? 'nav-item active' : 'nav-item'} onClick={() => setSection('recent')}>
                    <span className="nav-icon">◷</span> Недавние
                </button>
            </nav>

            <div className="nav-caption second-caption">СОВМЕСТНАЯ РАБОТА</div>

            <nav className="main-nav">
                <button className={section === 'shared' ? 'nav-item active' : 'nav-item'} onClick={() => setSection('shared')}>
                    <span className="nav-icon">♧</span> Доступные мне
                    <span className="nav-count">{sharedWithMe.length}</span>
                </button>
                {auth.user.is_admin && (
                    <a className="nav-item" href="/admin">
                        <span className="nav-icon">⚙</span> Админка
                    </a>
                )}
            </nav>

            <div className="sidebar-bottom">
                <div className="storage-card">
                    <div className="storage-heading">
                        <span>☁ Хранилище</span>
                        <span>{usedPct}%</span>
                    </div>
                    <div className="storage-track">
                        <div className="storage-progress" style={{ width: `${usedPct}%` }}></div>
                    </div>
                    <p>Использовано {storage.used_kb} КБ из {storage.quota_kb} КБ</p>
                </div>

                <div className="profile-button">
                    <span className="avatar">{auth.user.name.slice(0, 1).toUpperCase()}</span>
                    <span className="profile-info">
                        <strong>{auth.user.name}</strong>
                        <button onClick={() => router.post('/logout')}>Выйти</button>
                        <small>Личное пространство</small>
                    </span>
                    <span className="profile-menu">···</span>
                </div>
            </div>
        </aside>

        <main className="main-content">
            <header className="topbar">
                <div className="breadcrumbs">
                    <span>Рабочее пространство</span>
                    <span className="breadcrumb-separator">/</span>
                    <strong>Мои документы</strong>
                </div>

                <div className="topbar-actions">
                    <button className="icon-button" title="Уведомления" onClick={() => window.alert('Уведомления добавим позже.')}>♧</button>

                    <div className="theme-picker">
                        <button className="theme-trigger" onClick={() => setShowThemes(!showThemes)}>
                            <span>{theme === 'light' ? '☀' : theme === 'dark' ? '☾' : '◐'}</span>
                            <span>{themeNames[theme]}</span>
                            <span className="chevron">⌄</span>
                        </button>

                        {showThemes && (
                            <div className="theme-menu">
                                <div className="theme-menu-title">Оформление</div>
                                <button className={theme === 'light' ? 'theme-option selected' : 'theme-option'} onClick={() => { setTheme('light'); setShowThemes(false); }}>
                                    <span className="theme-preview light-preview">☀</span>
                                    <span><strong>Светлая</strong><small>Чистая и минималистичная</small></span>
                                    {theme === 'light' && <span className="theme-check">✓</span>}
                                </button>
                                <button className={theme === 'dark' ? 'theme-option selected' : 'theme-option'} onClick={() => { setTheme('dark'); setShowThemes(false); }}>
                                    <span className="theme-preview dark-preview">☾</span>
                                    <span><strong>Тёмная</strong><small>Комфортная для глаз</small></span>
                                    {theme === 'dark' && <span className="theme-check">✓</span>}
                                </button>
                                <button className={theme === 'mixed' ? 'theme-option selected' : 'theme-option'} onClick={() => { setTheme('mixed'); setShowThemes(false); }}>
                                    <span className="theme-preview mixed-preview">◐</span>
                                    <span><strong>Комбинированная</strong><small>Тёмная панель и светлая область</small></span>
                                    {theme === 'mixed' && <span className="theme-check">✓</span>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="page-content">
                <section className="welcome-section">
                    <div>
                        <div className="eyebrow"><span className="eyebrow-dot"></span> ТВОЁ ПРОСТРАНСТВО СОВМЕСТНОЙ РАБОТЫ</div>
                        <h1>Создавайте вместе. <span>Меняйте свободно.</span></h1>
                        <p>Редактируйте документы совместно и наблюдайте за изменениями в реальном времени.</p>
                    </div>
                    <div className="welcome-decoration">
                        <div className="decoration-sheet sheet-back"></div>
                        <div className="decoration-sheet sheet-front">
                            <span className="sheet-line long-line"></span>
                            <span className="sheet-line"></span>
                            <span className="sheet-line short-line"></span>
                            <span className="sheet-mark">✦</span>
                        </div>
                    </div>
                </section>

                <section className="quick-actions">
                    <button className="quick-card new-card" onClick={createDocument}>
                        <span className="quick-icon new-icon">＋</span>
                        <span><strong>Пустой документ</strong><small>Начни с чистого листа</small></span>
                        <span className="quick-arrow">↗</span>
                    </button>
                    <button className="quick-card" onClick={() => { setSection('all'); setSearch(''); }}>
                        <span className="quick-icon template-icon">▤</span>
                        <span><strong>Все документы</strong><small>Продолжи свою работу</small></span>
                        <span className="quick-arrow">↗</span>
                    </button>
                    <button className="quick-card" onClick={() => setSection('shared')}>
                        <span className="quick-icon favorite-icon">♧</span>
                        <span><strong>Доступные мне</strong><small>Документы коллег</small></span>
                        <span className="quick-arrow">↗</span>
                    </button>
                </section>

                <section className="documents-section">
                    <div className="section-heading">
                        <div>
                            <h2>{section === 'shared' ? 'Доступные мне' : section === 'recent' ? 'Недавние документы' : 'Мои документы'} <span>{filteredDocuments.length}</span></h2>
                            <p>Твои документы и последние изменения</p>
                        </div>

                        <div className="document-tools">
                            <label className="search-box">
                                <span>⌕</span>
                                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти документ..." />
                                <kbd>⌕</kbd>
                            </label>
                            <button className="sort-button" >☷ <span>Сортировка</span></button>
                        </div>
                    </div>

                    <div className="document-grid">
                        {filteredDocuments.map((item) => (
                            <article className="document-card" key={item.id}>
                                <div className={`document-preview preview-blue`}>
                                    <div className="preview-paper">
                                        <div className="paper-heading"></div>
                                        <div className="paper-line"></div>
                                        <div className="paper-line"></div>
                                        <div className="paper-line paper-short"></div>
                                        <div className="paper-block"></div>
                                        <div className="paper-line"></div>
                                        <div className="paper-line paper-short"></div>
                                    </div>
                                    <span className="file-type">DOC</span>
                                </div>

                                <div className="document-details">
                                    <div className="document-title-row">
                                        <span className={"file-icon"}>▤</span>
                                        <h3><Link href={`/docs/${item.id}`}>{item.title}</Link></h3>
                                        {item.is_owner && <button onClick={() => deleteDocument(item.id)}>Удалить</button>}
                                    </div>
                                    {item.preview && <p className="document-meta">{item.preview}</p>}
                                    <div className="document-meta">
                                        <span>{ROLE_LABEL[item.role] ?? item.role}</span>
                                        {!item.is_owner && <><span className="meta-dot">·</span><span>{item.owner_name}</span></>}
                                        <span className="meta-dot">·</span>
                                        <span>{formatDate(item.updated_at)}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {filteredDocuments.length === 0 && (
                        <div className="empty-state">
                            <span>⌕</span>
                            <h3>Документы не найдены</h3>
                            <p>Попробуй изменить запрос или создай новый документ.</p>
                            <button className="create-button empty-create" onClick={createDocument}>＋ Создать документ</button>
                        </div>
                    )}
                </section>

                <footer className="page-footer">
                    <span>© 2026 duoChange</span>
                    <span>Твои идеи заслуживают порядка <span className="footer-star">✦</span></span>
                </footer>
            </div>
        </main>
    </div>
);

}