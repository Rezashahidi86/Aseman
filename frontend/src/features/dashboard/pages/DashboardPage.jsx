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
    <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400" role="status">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-950" />
      <span>در حال دریافت اطلاعات از سرور...</span>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <section className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 font-extrabold dark:bg-rose-900/50" aria-hidden="true">!</span>
      <div>
        <h2 className="text-xs font-extrabold">دریافت اطلاعات ناموفق بود</h2>
        <p className="mt-1 text-xs leading-6">{message}</p>
        <button className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold hover:bg-rose-100 dark:border-rose-800 dark:bg-slate-900 dark:hover:bg-rose-950" type="button" onClick={onRetry}>تلاش دوباره</button>
      </div>
    </section>
  );
}

function AdminSummary({ report }) {
  return (
    <>
      <div className="mb-4 mt-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold">خلاصه عملکرد شعبه‌ها</h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">آمار ماه {report.month || ''}</p>
        </div>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-[10px] text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">دسترسی مدیر</span>
      </div>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="خلاصه آمار">
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
      {dashboard.warnings.map((warning) => <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" key={warning}>{warning}</p>)}
      <div className="mb-4 mt-8 flex items-center justify-between gap-4">
        <div><h2 className="text-base font-extrabold">خلاصه شعبه</h2><p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">وضعیت اطلاعات شعبه</p></div>
        <span className="max-w-40 rounded-full bg-indigo-50 px-3 py-2 text-center text-[10px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{branchName}</span>
      </div>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="خلاصه اطلاعات شعبه">
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

      if (productsResult.status === 'rejected' && branchResult.status === 'rejected') throw productsResult.reason;

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
  const branchName = dashboard?.branch?.name || (typeof user?.branch === 'object' ? user.branch.name : '') || 'شعبه من';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
            {error && <ErrorState message={error} onRetry={loadDashboard} />}
            <DashboardWelcome isAdmin={isAdmin} branchName={branchName} />
            {isLoading && <LoadingState />}
            {!isLoading && dashboard?.type === 'admin' && <AdminSummary report={dashboard.report} />}
            {!isLoading && dashboard?.type === 'seller' && <SellerSummary dashboard={dashboard} branchName={branchName} />}
          </main>
        </div>
      </div>
    </div>
  );
}
