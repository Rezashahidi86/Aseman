import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { ThemeToggle } from '../../../shared/components/ThemeToggle.jsx';

const numberFormatter = new Intl.NumberFormat('fa-IR');
const moneyFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });

function formatMoney(value) {
  return `${moneyFormatter.format(Number(value) || 0)} تومان`;
}

function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

function getBranchId(user) {
  if (!user?.branch) return '';
  return typeof user.branch === 'string' ? user.branch : user.branch._id || user.branch.id || '';
}

function SummaryCard({ icon, label, value, hint }) {
  return (
    <article className="summary-card">
      <div className="summary-card__top">
        <span className="summary-card__label">{label}</span>
        <span className="summary-card__icon" aria-hidden="true">{icon}</span>
      </div>
      <strong>{value}</strong>
      <span className="summary-card__hint">{hint}</span>
    </article>
  );
}

function ErrorNotice({ message, onRetry }) {
  return (
    <section className="error-notice" role="alert">
      <span className="error-symbol" aria-hidden="true">!</span>
      <div>
        <h2>دریافت اطلاعات ناموفق بود</h2>
        <p>{message}</p>
        <button className="button button--secondary" type="button" onClick={onRetry}>تلاش دوباره</button>
      </div>
    </section>
  );
}

export function DashboardPage() {
  const { token, user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (user?.role === 'ADMIN') {
        const response = await apiRequest('/reports/all-branches', { token });
        setDashboard({ kind: 'admin', report: response?.data?.report });
        return;
      }

      const branchId = getBranchId(user);

      if (!branchId) {
        throw new Error('حساب کاربری شما به شعبه‌ای اختصاص داده نشده است.');
      }

      const [productResult, branchResult] = await Promise.allSettled([
        apiRequest('/products?limit=1', { token }),
        apiRequest(`/branches/${branchId}`, { token }),
      ]);

      const products = productResult.status === 'fulfilled' ? productResult.value?.pagination?.total : null;
      const branch = branchResult.status === 'fulfilled' ? branchResult.value?.data?.branch : user.branch;

      if (productResult.status === 'rejected' && branchResult.status === 'rejected') {
        throw productResult.reason;
      }

      setDashboard({
        kind: 'seller',
        report: {},
        productCount: products,
        branch,
        warnings: [
          productResult.status === 'rejected' ? 'تعداد محصولات دریافت نشد.' : '',
          branchResult.status === 'rejected' ? 'جزئیات شعبه دریافت نشد.' : '',
        ].filter(Boolean),
      });
    } catch (loadError) {
      setError(loadError.message || 'خطا در دریافت اطلاعات داشبورد.');
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoggingOut) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = dashboard?.kind === 'admin';
  const report = dashboard?.report || {};
  const branchName = dashboard?.branch?.name || (typeof user?.branch === 'object' ? user.branch.name : '') || 'شعبه من';

  return (
    <div className="app-shell" dir="rtl">
      <div className="dashboard-layout">
        <aside className="sidebar">
          <a className="brand" href="/" aria-label="آسمان، داشبورد">
            <span className="brand__mark">آ</span>
            <span>
              <strong>آسمان</strong>
              <small>مدیریت فروشگاه</small>
            </span>
          </a>

          <div className="sidebar__caption">فضای کاری</div>
          <nav className="navigation" aria-label="ناوبری اصلی">
            <a className="navigation__item navigation__item--active" href="/" aria-current="page">
              <span className="navigation__symbol" aria-hidden="true">⌂</span>
              <span>داشبورد</span>
            </a>
            <div className="navigation__item navigation__item--disabled" aria-disabled="true">
              <span className="navigation__symbol" aria-hidden="true">▦</span>
              <span>محصولات و موجودی</span>
              <span className="nav-soon">بعداً</span>
            </div>
            <div className="navigation__item navigation__item--disabled" aria-disabled="true">
              <span className="navigation__symbol" aria-hidden="true">↗</span>
              <span>فروش‌ها</span>
              <span className="nav-soon">بعداً</span>
            </div>
            <div className="navigation__item navigation__item--disabled" aria-disabled="true">
              <span className="navigation__symbol" aria-hidden="true">♙</span>
              <span>مشتریان</span>
              <span className="nav-soon">بعداً</span>
            </div>
            <div className="navigation__item navigation__item--disabled" aria-disabled="true">
              <span className="navigation__symbol" aria-hidden="true">▥</span>
              <span>گزارش‌ها</span>
              <span className="nav-soon">بعداً</span>
            </div>
          </nav>

          <div className="sidebar__footer">
            <span className="status-dot" />
            <span>نشست کاربری فعال است</span>
          </div>
        </aside>

        <div className="main-column">
          <header className="topbar">
            <div>
              <p className="topbar__eyebrow">سلام {user?.name || 'کاربر عزیز'}، خوش آمدی</p>
              <h1>داشبورد</h1>
            </div>
            <div className="topbar__actions">
              <ThemeToggle />
              <div className="topbar__profile">
                <span className="avatar">{(user?.name || 'ک').slice(0, 1)}</span>
                <span>
                  <strong>{user?.name || 'کاربر'}</strong>
                  <small>{user?.role === 'ADMIN' ? 'مدیر سامانه' : 'فروشنده'}</small>
                </span>
              </div>
              <button className="button button--secondary logout-button" type="button" onClick={handleLogout} disabled={isLoggingOut}>
                خروج
              </button>
            </div>
          </header>

          <main className="page-content">
            {error && <ErrorNotice message={error} onRetry={loadDashboard} />}

            <section className="welcome-panel">
              <div className="welcome-panel__content">
                <span className="welcome-panel__label">{isAdmin ? 'نمای کلی مدیریتی' : 'فضای کاری شعبه'}</span>
                <h2>{isAdmin ? 'تصویر روشن‌تری از کسب‌وکارت داشته باش.' : `امروز در ${branchName}، همه‌چیز مرتب پیش می‌رود.`}</h2>
                <p>
                  {isAdmin
                    ? 'وضعیت فروش و عملکرد شعبه‌ها را از یک نقطه دنبال کن.'
                    : 'آمار فروش روزانه و وضعیت محصولات شعبه‌ات را در یک نگاه ببین.'}
                </p>
              </div>
              <div className="welcome-panel__illustration" aria-hidden="true">
                <span className="illustration-card illustration-card--one">فروش هوشمند</span>
                <span className="illustration-card illustration-card--two">مدیریت ساده</span>
                <span className="illustration-orbit">آ</span>
              </div>
            </section>

            {isLoading && (
              <div className="dashboard-loading" role="status">
                <span className="loading-dot" />
                <span>در حال دریافت آمار از سرور...</span>
              </div>
            )}

            {dashboard && !isLoading && (
              <>
                {dashboard.warnings?.map((warning) => (
                  <p className="inline-warning" key={warning}>{warning}</p>
                ))}

                <div className="section-heading">
                  <div>
                    <h2>{isAdmin ? 'خلاصه عملکرد شعبه‌ها' : 'خلاصه امروز'}</h2>
                    <p>{isAdmin ? `آمار ماه ${report.month || ''}` : `گزارش روز ${report.date || ''}`}</p>
                  </div>
                  <span className="status-pill">{isAdmin ? 'دسترسی مدیر' : branchName}</span>
                </div>

                <section className="summary-grid" aria-label="خلاصه آمار">
                  <SummaryCard
                    icon="↗"
                    label={isAdmin ? 'مجموع فروش ماه' : 'فروش امروز'}
                    value={isAdmin ? formatMoney(report.totals?.totalSales ?? report.totalSales) : '—'}
                    hint={isAdmin ? 'مجموع مبلغ فروش ثبت‌شده' : 'آمار فروش فروشنده هنوز در API مجاز نشده است'}
                  />
                  <SummaryCard
                    icon="◈"
                    label={isAdmin ? 'سود ناخالص ماه' : 'سود ناخالص امروز'}
                    value={isAdmin ? formatMoney(report.totals?.totalProfit ?? report.totalProfit) : '—'}
                    hint={isAdmin ? 'محاسبه‌شده بر اساس قیمت خرید ثبت‌شده' : 'آمار سود فروشنده هنوز در API مجاز نشده است'}
                  />
                  <SummaryCard
                    icon="▤"
                    label="تعداد فاکتور"
                    value={isAdmin ? formatNumber(report.totals?.salesCount ?? report.salesCount) : '—'}
                    hint={isAdmin ? 'تعداد فروش‌های ثبت‌شده' : 'آمار فروش فروشنده هنوز در API مجاز نشده است'}
                  />
                  <SummaryCard
                    icon="▦"
                    label={isAdmin ? 'تعداد شعبه‌ها' : 'محصولات شعبه'}
                    value={isAdmin ? formatNumber(report.branches?.length) : dashboard.productCount === null ? '—' : formatNumber(dashboard.productCount)}
                    hint={isAdmin ? 'شعبه‌های موجود در سامانه' : 'تعداد محصولات ثبت‌شده'}
                  />
                </section>

                {isAdmin && (
                  <section className="panel branch-panel">
                    <div className="panel__heading">
                      <div>
                        <h2>عملکرد شعبه‌ها</h2>
                        <p>خلاصه فروش ماه جاری هر شعبه</p>
                      </div>
                      <span className="panel__badge">مدیریت</span>
                    </div>
                    {report.branches?.length ? (
                      <div className="branch-list">
                        {report.branches.map((item) => (
                          <article className="branch-row" key={item.branch.id || item.branch._id}>
                            <div className="branch-row__name">
                              <span className="branch-row__icon" aria-hidden="true">⌂</span>
                              <div>
                                <span>{item.branch.name}</span>
                                <div className="branch-row__meta">{item.branch.code} · {item.branch.isActive ? 'فعال' : 'غیرفعال'}</div>
                              </div>
                            </div>
                            <div className="branch-row__value">
                              {formatMoney(item.totalSales)}
                              <small>{formatNumber(item.salesCount)} فروش</small>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-state">هنوز آماری برای شعبه‌ها ثبت نشده است.</p>
                    )}
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
