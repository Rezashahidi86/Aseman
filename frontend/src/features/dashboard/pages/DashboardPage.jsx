import { useCallback, useEffect, useState } from 'react';
import { FiAlertCircle, FiBarChart2, FiBox, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { getAllBranchesDailyReport, getBranch, getBranchMonthlyReport, getProducts } from '../../../api/services/dashboardService.js';
import { getBranches } from '../../../api/services/branchService.js';
import { formatJalaliMonth, getDateKeyInTimeZone, getJalaliMonthKey } from '../../../shared/utils/date.js';
import { formatMoney, formatNumber } from '../../../shared/utils/format.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { BranchPerformance } from '../components/BranchPerformance.jsx';
import { DashboardHeader } from '../components/DashboardHeader.jsx';
import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { DashboardWelcome } from '../components/DashboardWelcome.jsx';
import { SummaryCard } from '../components/SummaryCard.jsx';
import { WeeklySalesCharts } from '../components/WeeklySalesCharts.jsx';

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
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 dark:bg-rose-900/50" aria-hidden="true"><FiAlertCircle size={18} /></span>
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
      <WeeklySalesCharts reports={report.dailyReports} />
      <BranchPerformance branches={report.branches} />
    </>
  );
}

function SellerSummary({ dashboard, branchName }) {
  return (
    <>
      {dashboard.warnings.map((warning) => <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" key={warning}>{warning}</p>)}
      <div className="mb-4 mt-8 flex items-center justify-between gap-4">
        <div><h2 className="text-base font-extrabold">خلاصه شعبه</h2><p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">آمار فروش روزانه و ماهانه شعبه</p></div>
        <span className="max-w-40 rounded-full bg-indigo-50 px-3 py-2 text-center text-[10px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{branchName}</span>
      </div>
      <h3 className="mb-3 mt-5 text-sm font-extrabold">عملکرد ماه {formatJalaliMonth(dashboard.monthlyStats.month)}</h3>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="آمار ماهانه شعبه">
        <SummaryCard icon={FiTrendingUp} label="فروش این ماه" value={formatMoney(dashboard.monthlyStats.totalSales)} hint="مجموع فروش از ابتدای ماه جاری" />
        <SummaryCard icon={FiBarChart2} label="سود این ماه" value={formatMoney(dashboard.monthlyStats.totalProfit)} hint="سود ناخالص فروش‌های این ماه" />
        <SummaryCard icon={FiFileText} label="فاکتورهای این ماه" value={formatNumber(dashboard.monthlyStats.salesCount)} hint="تعداد فاکتورهای ثبت‌شده در ماه جاری" />
        <SummaryCard icon={FiBox} label="اقلام فروخته‌شده این ماه" value={formatNumber(dashboard.monthlyStats.totalItemsSold)} hint="جمع تعداد کالاهای فروخته‌شده در ماه جاری" />
      </section>
      <h3 className="mb-3 mt-7 text-sm font-extrabold">عملکرد امروز</h3>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="آمار روزانه شعبه">
        <SummaryCard icon={FiBox} label="محصولات شعبه" value={dashboard.productCount === null ? '—' : formatNumber(dashboard.productCount)} hint="تعداد محصولات ثبت‌شده" />
        <SummaryCard icon={FiTrendingUp} label="فروش امروز" value={formatMoney(dashboard.todaySales)} hint="مجموع مبلغ فروش امروز" />
        <SummaryCard icon={FiBarChart2} label="سود امروز" value={formatMoney(dashboard.todayProfit)} hint="سود فروش‌های ثبت‌شده امروز" />
        <SummaryCard icon={FiFileText} label="تعداد فاکتور امروز" value={formatNumber(dashboard.todaySalesCount)} hint="تعداد فروش‌های ثبت‌شده امروز" />
        <SummaryCard icon={FiTrendingUp} label="اقلام فروخته‌شده امروز" value={formatNumber(dashboard.todayItemsSold)} hint="جمع تعداد کالاهای فروخته‌شده امروز" />
      </section>
    </>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (user?.role === 'ADMIN') {
        const endDate = getDateKeyInTimeZone();
        const [year, month, day] = endDate.split('-').map(Number);
        const startDate = new Date(Date.UTC(year, month - 1, day - 6))
          .toISOString()
          .slice(0, 10);
        const branchesResponse = await getBranches();
        const branches = branchesResponse?.data?.branches || [];
        const currentJalaliMonth = getJalaliMonthKey();
        const [monthlyResults, dailyResponse] = await Promise.all([
          Promise.all(
            branches.map(async (branch) => {
              const branchId = branch._id || branch.id;
              const response = await getBranchMonthlyReport(branchId, currentJalaliMonth);
              return {
                branch: {
                  id: branchId,
                  name: branch.name,
                  code: branch.code,
                  isActive: branch.isActive,
                },
                ...response?.data?.report,
              };
            }),
          ),
          getAllBranchesDailyReport({ startDate, endDate }),
        ]);
        setDashboard({
          type: 'admin',
          report: {
            month: currentJalaliMonth,
            branches: monthlyResults,
          },
          dailyReports: dailyResponse?.data?.report?.reports || [],
        });
        return;
      }

      const branchId = getBranchId(user);
      if (!branchId) throw new Error('حساب کاربری شما به شعبه‌ای اختصاص داده نشده است.');

      const today = getDateKeyInTimeZone();
      const results = await Promise.allSettled([
        getProducts({ limit: 1 }),
        getBranch(branchId),
        getAllBranchesDailyReport({ startDate: today, endDate: today }),
        getBranchMonthlyReport(branchId, getJalaliMonthKey()),
      ]);
      const [productsResult, branchResult, dailyResult, monthlyResult] = results;

      if (results.every((result) => result.status === 'rejected')) {
        throw productsResult.reason;
      }

      const dailyReports = dailyResult.status === 'fulfilled' ? dailyResult.value?.data?.report?.reports || [] : [];
      const todayStats = dailyReports.reduce((totals, item) => ({
        totalSales: totals.totalSales + (Number(item.totalSales) || 0),
        totalProfit: totals.totalProfit + (Number(item.totalProfit) || 0),
        totalItemsSold: totals.totalItemsSold + (Number(item.totalItemsSold) || 0),
        salesCount: totals.salesCount + (Number(item.salesCount) || 0),
      }), { totalSales: 0, totalProfit: 0, totalItemsSold: 0, salesCount: 0 });

      const monthlyStats = monthlyResult.status === 'fulfilled'
        ? monthlyResult.value?.data?.report || {}
        : {};

      setDashboard({
        type: 'seller',
        productCount: productsResult.status === 'fulfilled' ? productsResult.value?.pagination?.total ?? null : null,
        branch: branchResult.status === 'fulfilled' ? branchResult.value?.data?.branch || user.branch : user.branch,
        monthlyStats: {
          month: monthlyStats.month || getJalaliMonthKey(),
          totalSales: Number(monthlyStats.totalSales) || 0,
          totalProfit: Number(monthlyStats.totalProfit) || 0,
          totalItemsSold: Number(monthlyStats.totalItemsSold) || 0,
          salesCount: Number(monthlyStats.salesCount) || 0,
        },
        todaySales: todayStats.totalSales,
        todayProfit: todayStats.totalProfit,
        todayItemsSold: todayStats.totalItemsSold,
        todaySalesCount: todayStats.salesCount,
        warnings: [
          productsResult.status === 'rejected' ? 'تعداد محصولات دریافت نشد.' : '',
          branchResult.status === 'rejected' ? 'جزئیات شعبه دریافت نشد.' : '',
          dailyResult.status === 'rejected' ? 'گزارش فروش امروز دریافت نشد.' : '',
          monthlyResult.status === 'rejected' ? 'گزارش فروش ماه جاری دریافت نشد.' : '',
        ].filter(Boolean),
      });
    } catch (loadError) {
      setError(loadError.message || 'خطا در دریافت اطلاعات داشبورد.');
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const isAdmin = user?.role === 'ADMIN';
  const branchName = dashboard?.branch?.name || (typeof user?.branch === 'object' ? user.branch?.name : '') || 'شعبه من';

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
            {!isLoading && dashboard?.type === 'admin' && <AdminSummary report={{ ...dashboard.report, dailyReports: dashboard.dailyReports }} />}
            {!isLoading && dashboard?.type === 'seller' && <SellerSummary dashboard={dashboard} branchName={branchName} />}
          </main>
        </div>
      </div>
    </div>
  );
}
