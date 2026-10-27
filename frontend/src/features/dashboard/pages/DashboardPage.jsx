import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../../api/client.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { BranchPerformance } from '../components/BranchPerformance.jsx';
import { DashboardHeader } from '../components/DashboardHeader.jsx';
import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { DashboardWelcome } from '../components/DashboardWelcome.jsx';
import { SummaryCard } from '../components/SummaryCard.jsx';

const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('fa-IR');

function formatMoney(value) {
  return money.format(Number(value) || 0) + ' تومان';
}

function formatNumber(value) {
  return number.format(Number(value) || 0);
}

function getBranchId(user) {
  if (!user?.branch) return '';
  return typeof user.branch === 'string' ? user.branch : user.branch._id || user.branch.id || '';
}

function LoadingState() {
  return (
    <div className="dashboard-loading" role="status">
      <span className="loading-dot" />
      <span>در حال دریافت اطلاعات از سرور...</span>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
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

function AdminSummary({ report }) {
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>خلاصه عملکرد شعبه‌ها</h2>
          <p>آمار ماه {report.month || ''}</p>
        </div>
        <span className="status-pill">دسترسی مدیر</span>
      </div>
      <section className="summary-grid" aria-label="خلاصه آمار">
        <SummaryCard icon="↗" label="مجموع فروش ماه" value={formatMoney(report.totals?.totalSales ?? report.totalSales)} hint="مجموع مبلغ فروش ثبت‌شده" />
        <SummaryCard icon="◈" label="سود ناخالص ماه" value={formatMoney(report.totals?.totalProfit ?? report.totalProfit)} hint="بر اساس قیمت خرید ثبت‌شده" />
        <SummaryCard icon="▤" label="تعداد فاکتور" value={formatNumber(report.totals?.salesCount ?? report.salesCount)} hint="تعداد فروش‌های ثبت‌شده" />
        <SummaryCard icon="▦" label="تعداد شعبه‌ها" value={formatNumber(report.branches?.length)} hint="شعبه‌های موجود در سامانه" />
      </section>
      <BranchPerformance branches={report.branches} />
    </>
  );
}

function SellerSummary({ dashboard, branchName }) {
  return (
    <>
      {dashboard.warnings.map((warning) => <p className="inline-warning" key={warning}>{warning}</p>)}
      <div className="section-heading">
        <div><h2>خلاصه شعبه</h2><p>وضعیت اطلاعات شعبه</p></div>
        <span className="status-pill">{branchName}</span>
      </div>
      <section className="summary-grid" aria-label="خلاصه اطلاعات شعبه">
        <SummaryCard icon="▦" label="محصولات شعبه" value={dashboard.productCount === null ? '—' : formatNumber(dashboard.productCount)} hint="تعداد محصولات ثبت‌شده" />
        <SummaryCard icon="↗" label="فروش امروز" value="—" hint="گزارش فروش فروشنده هنوز در API مجاز نشده است" />
        <SummaryCard icon="◈" label="سود امروز" value="—" hint="گزارش سود فروشنده هنوز در API مجاز نشده است" />
      </section>
    </>
  );
}

export function DashboardPage() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (user?.role === 'ADMIN') {
        const response = await apiRequest('/reports/all-branches', { token });
        setDashboard({ type: 'admin', report: response?.data?.report || {} });
        return;
      }

      const branchId = getBranchId(user);
      if (!branchId) throw new Error('حساب کاربری شما به شعبه‌ای اختصاص داده نشده است.');

      const results = await Promise.allSettled([
        apiRequest('/products?limit=1', { token }),
        apiRequest('/branches/' + branchId, { token }),
      ]);
      const [productsResult, branchResult] = results;

      if (productsResult.status === 'rejected' && branchResult.status === 'rejected') {
        throw productsResult.reason;
      }

      setDashboard({
        type: 'seller',
        productCount: productsResult.status === 'fulfilled' ? productsResult.value?.pagination?.total ?? null : null,
        branch: branchResult.status === 'fulfilled' ? branchResult.value?.data?.branch || user.branch : user.branch,
        warnings: [
          productsResult.status === 'rejected' ? 'تعداد محصولات دریافت نشد.' : '',
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

  const isAdmin = user?.role === 'ADMIN';
  const branchName = dashboard?.branch?.name
    || (typeof user?.branch === 'object' ? user.branch.name : '')
    || 'شعبه من';

  return (
    <div className="app-shell" dir="rtl">
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="main-column">
          <DashboardHeader />
          <main className="page-content">
            {error && <ErrorState message={error} onRetry={loadDashboard} />}
            <DashboardWelcome isAdmin={isAdmin} branchName={branchName} />
            {isLoading && <LoadingState />}
            {!isLoading && dashboard?.type === 'admin' && <AdminSummary report={dashboard.report} />}
            {!isLoading && dashboard?.type === 'seller' && (
              <SellerSummary dashboard={dashboard} branchName={branchName} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
