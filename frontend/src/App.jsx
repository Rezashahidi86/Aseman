import { Component, useState } from 'react';

const navigationItems = [
  { id: 'dashboard', label: 'داشبورد', symbol: '⌂' },
  { id: 'products', label: 'محصولات و موجودی', symbol: '▦' },
  { id: 'sales', label: 'فروش‌ها', symbol: '↗' },
  { id: 'customers', label: 'مشتریان', symbol: '♙' },
  { id: 'documents', label: 'اسناد دستی', symbol: '▤' },
  { id: 'reports', label: 'گزارش‌ها', symbol: '▥' },
];

const pageTitles = {
  dashboard: 'داشبورد',
  products: 'محصولات و موجودی',
  sales: 'فروش‌ها',
  customers: 'مشتریان',
  documents: 'اسناد دستی',
  reports: 'گزارش‌ها',
};

function ErrorNotice({ message, onRetry }) {
  return (
    <section className="error-notice" role="alert">
      <span className="error-notice__icon" aria-hidden="true">!</span>
      <div>
        <h2>مشکلی پیش آمده است</h2>
        <p>{message}</p>
        {onRetry && <button className="button button--secondary" onClick={onRetry}>تلاش دوباره</button>}
      </div>
    </section>
  );
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Application rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error">
          <ErrorNotice
            message="بارگذاری این بخش با خطا مواجه شد. صفحه را دوباره بارگذاری کنید."
            onRetry={() => window.location.reload()}
          />
        </main>
      );
    }

    return this.props.children;
  }
}

function AppShell() {
  const [activePage, setActivePage] = useState('dashboard');
  const [notice, setNotice] = useState('');

  const selectPage = (page) => {
    setActivePage(page);
    setNotice('');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" onClick={() => selectPage('dashboard')}>
          <span className="brand__mark">آ</span>
          <span>
            <strong>آسمان</strong>
            <small>مدیریت فروشگاه</small>
          </span>
        </a>

        <div className="sidebar__caption">منوی اصلی</div>
        <nav className="navigation" aria-label="ناوبری اصلی">
          {navigationItems.map((item) => (
            <button
              className={`navigation__item ${activePage === item.id ? 'navigation__item--active' : ''}`}
              key={item.id}
              onClick={() => selectPage(item.id)}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              <span className="navigation__symbol" aria-hidden="true">{item.symbol}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="status-dot" />
          <span>سامانه آماده راه‌اندازی است</span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div>
            <p className="topbar__eyebrow">سامانه مدیریت فروشگاه</p>
            <h1>{pageTitles[activePage]}</h1>
          </div>
          <div className="topbar__profile">
            <span className="avatar">م</span>
            <span>
              <strong>کاربر سامانه</strong>
              <small>حساب کاربری</small>
            </span>
          </div>
        </header>

        <main className="page-content">
          {notice && <ErrorNotice message={notice} onRetry={() => setNotice('')} />}
          <section className="welcome-panel">
            <div className="welcome-panel__content">
              <span className="welcome-panel__label">نسخه اولیه رابط کاربری</span>
              <h2>به آسمان خوش آمدید</h2>
              <p>
                زیرساخت رابط کاربری آماده است. بخش‌های محصولات، فروش، مشتریان و گزارش‌ها
                در مراحل بعد به API بک‌اند متصل می‌شوند.
              </p>
              <button
                className="button button--primary"
                onClick={() => setNotice('هنوز داده‌ای برای نمایش وجود ندارد؛ اتصال API در تسک‌های بعدی انجام می‌شود.')}
              >
                بررسی وضعیت سامانه
              </button>
            </div>
            <div className="welcome-panel__illustration" aria-hidden="true">
              <span className="illustration-card illustration-card--one">فروش</span>
              <span className="illustration-card illustration-card--two">موجودی</span>
              <span className="illustration-orbit">آ</span>
            </div>
          </section>

          <div className="section-heading">
            <div>
              <h2>نمای کلی</h2>
              <p>با آماده‌شدن اتصال بک‌اند، اطلاعات این بخش نمایش داده می‌شود.</p>
            </div>
            <span className="status-pill">در انتظار اتصال API</span>
          </div>

          <section className="summary-grid" aria-label="خلاصه اطلاعات">
            <article className="summary-card">
              <span className="summary-card__label">محصولات</span>
              <strong>—</strong>
              <span className="summary-card__hint">تعداد محصولات ثبت‌شده</span>
            </article>
            <article className="summary-card">
              <span className="summary-card__label">فروش امروز</span>
              <strong>—</strong>
              <span className="summary-card__hint">مجموع فروش روز جاری</span>
            </article>
            <article className="summary-card">
              <span className="summary-card__label">موجودی کم</span>
              <strong>—</strong>
              <span className="summary-card__hint">محصولات نزدیک به اتمام</span>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppShell />
    </AppErrorBoundary>
  );
}
