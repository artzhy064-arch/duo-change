import { useEffect, useState } from 'react';
import '../../css/app.css';
import {router, usePage } from '@inertiajs/react';


type Theme = 'light' | 'dark' | 'mixed';

type DocumentItem = {
    id: number;
    title: string;
    content: string | null;
    visibility: string;
    created_at: string;
    updated_at: string;
    category: string;
    favorite: boolean;
    color: string;
    updated: string;
};

type MyDocProps = {
    documents: DocumentItem[];
};

export default function MyDoc({ documents: documents = [] }: MyDocProps) {
    const [theme, setTheme] = useState<Theme>('mixed');
    const [search, setSearch] = useState('');
    const { auth } = usePage<{auth: {user: { name: string } } }>().props;
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

// function toggleFavorite(id: number) {
//     setDocs((previous) =>
//         previous.map((item) =>
//             item.id === id ? { ...item, favorite: !item.favorite } : item
//         )
//     );
// }

const filteredDocuments = documents.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());

    if (section === 'favorites') {
        return matchesSearch && item.favorite;
    }

    if (section === 'recent') {
        return matchesSearch;
    }

    return matchesSearch;
});

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
                <button className={section === 'favorites' ? 'nav-item active' : 'nav-item'} onClick={() => setSection('favorites')}>
                    <span className="nav-icon">☆</span> Избранное
                </button>
            </nav>

            <div className="nav-caption second-caption">УПРАВЛЕНИЕ</div>

            <nav className="main-nav">
                <button className="nav-item" onClick={() => window.alert('Раздел общего доступа добавим позже.')}>
                    <span className="nav-icon">♧</span> Доступные мне
                </button>
                <button className="nav-item" onClick={() => window.alert('Корзину подключим позже.')}>
                    <span className="nav-icon">♲</span> Корзина
                </button>
            </nav>

            <div className="sidebar-bottom">
                <div className="storage-card">
                    <div className="storage-heading">
                        <span>☁ Хранилище</span>
                        <span>12%</span>
                    </div>
                    <div className="storage-track">
                        <div className="storage-progress"></div>
                    </div>
                    <p>Использовано 1,2 ГБ из 10 ГБ</p>
                </div>

                <button className="profile-button">
                    <span className="avatar">{auth.user.name}</span>
                    <span className="profile-info">
                        <strong>{auth.user.name}</strong>
                        <button onClick={() => router.post('/logout')}>Logout</button>
                        <small>Личное пространство</small>
                    </span>
                    <span className="profile-menu">···</span>
                </button>
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
                    <button className="quick-card" onClick={() => setSection('favorites')}>
                        <span className="quick-icon favorite-icon">☆</span>
                        <span><strong>Избранное</strong><small>Важное всегда под рукой</small></span>
                        <span className="quick-arrow">↗</span>
                    </button>
                </section>

                <section className="documents-section">
                    <div className="section-heading">
                        <div>
                            <h2>{section === 'favorites' ? 'Избранное' : section === 'recent' ? 'Недавние документы' : 'Мои документы'} <span>{filteredDocuments.length}</span></h2>
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
                                    <button className="favorite-button" title={item.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}>
                                        {item.favorite ? '★' : '☆'}
                                    </button>
                                    <span className="file-type">DOC</span>
                                </div>

                                <div className="document-details">
                                    <div className="document-title-row">
                                        <span className={`file-icon file-${item.color}`}>▤</span>
                                        <h3>{item.title}</h3>
                                        <button className="more-button" title="Дополнительные действия" onClick={() => window.alert('Меню документа добавим позже.')}>···</button>
                                    </div>
                                    <div className="document-meta">
                                        <span className="meta-dot">·</span>
                                        <span>{item.updated_at}</span>
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