import { useCallback, useEffect, useState } from 'react';
import { FiBarChart2, FiCalendar, FiFileText, FiTrendingUp, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';
import { getFilteredReport } from '../../../api/services/reportsService.js';
import { getAllBranchesReport } from '../../../api/services/dashboardService.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';
import { showError } from '../../../shared/utils/notifications.js';
import { formatJalaliDate, parseJalaliDate } from '../utils/jalaliDate.js';

const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const digits = new Intl.NumberFormat('fa-IR');
const dateKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};
const today = dateKey(new Date());
const weekStart = dateKey(new Date(Date.now() - 6 * 86400000));
const formatMoney = (value) => `${money.format(Number(value) || 0)} تومان`;

function StatCard({ icon: Icon, label, value, hint }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Icon size={19} /></span><span className="text-xs text-slate-500 dark:text-slate-400">{label}</span></div><p className="mt-4 break-words text-xl font-extrabold">{value}</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p></article>;
}

export function ReportsPage() {
  const { user } = useAuth();
  const { activeBranchId, activeBranch, isLoadingBranches } = useActiveBranch();
  const isAdmin = user?.role === 'ADMIN';
  const [startDate, setStartDate] = useState(weekStart);
  const [endDate, setEndDate] = useState(today);
  const [startDateText, setStartDateText] = useState(() => formatJalaliDate(weekStart));
  const [endDateText, setEndDateText] = useState(() => formatJalaliDate(today));
  const [groupBy, setGroupBy] = useState('day');
  const [report, setReport] = useState(null);
  const [allBranches, setAllBranches] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    if (!isAdmin) {
      setError('گزارش‌گیری در حال حاضر فقط برای مدیر سامانه مجاز است.');
      return;
    }
    if (!activeBranchId) {
      setReport(null);
      setError('برای دریافت گزارش، شعبه فعال را انتخاب کنید.');
      return;
    }
    const parsedStartDate = parseJalaliDate(startDateText);
    const parsedEndDate = parseJalaliDate(endDateText);
    if (!parsedStartDate || !parsedEndDate) {
      setError('تاریخ را به‌صورت شمسی و با قالب ۱۴۰۵/۰۸/۰۲ وارد کنید.');
      return;
    }
    if (parsedStartDate > parsedEndDate) {
      setError('تاریخ شروع نباید بعد از تاریخ پایان باشد.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const [filtered, all] = await Promise.all([
        getFilteredReport({ branchId: activeBranchId, startDate: parsedStartDate, endDate: parsedEndDate, groupBy, sortBy: 'totalSales', sortOrder: 'desc' }),
        getAllBranchesReport(),
      ]);
      setReport(filtered?.data?.report || null);
      setAllBranches(all?.data?.report || null);
    } catch (requestError) {
      setError(requestError.message || 'دریافت گزارش با خطا مواجه شد.');
      showError(requestError.message || 'دریافت گزارش با خطا مواجه شد.');
    } finally {
      setIsLoading(false);
    }
  }, [activeBranchId, endDateText, groupBy, isAdmin, startDateText]);

  useEffect(() => {
    if (!isLoadingBranches) loadReport();
  }, [loadReport, isLoadingBranches]);

  const totals = report?.totals || {};
  const adminTotals = allBranches?.totals || {};
  const rows = report?.reports || [];

  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl"><div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]"><DashboardSidebar /><div className="min-w-0"><DashboardHeader /><main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
    <div className="mb-6"><p className="mb-2 text-xs text-slate-500 dark:text-slate-400">تحلیل عملکرد</p><h1 className="text-2xl font-extrabold">گزارش‌ها</h1><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">آمار فروش و سود در بازه زمانی انتخاب‌شده{activeBranch?.name ? ` · ${activeBranch.name}` : ''}</p></div>
    {!isAdmin ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">گزارش‌های این بخش فقط برای مدیر سامانه فعال است.</div> : <>
      <form className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_180px_auto] dark:border-slate-800 dark:bg-slate-900" onSubmit={(event) => { event.preventDefault(); loadReport(); }}>
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">از تاریخ شمسی<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="text" inputMode="numeric" placeholder="۱۴۰۵/۰۸/۰۲" value={startDateText} onChange={(event) => { const value = event.target.value; setStartDateText(value); const parsed = parseJalaliDate(value); if (parsed) setStartDate(parsed); }} aria-label="تاریخ شروع شمسی با قالب سال/ماه/روز" required /></label>
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">تا تاریخ شمسی<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="text" inputMode="numeric" placeholder="۱۴۰۵/۰۸/۰۹" value={endDateText} onChange={(event) => { const value = event.target.value; setEndDateText(value); const parsed = parseJalaliDate(value); if (parsed) setEndDate(parsed); }} aria-label="تاریخ پایان شمسی با قالب سال/ماه/روز" required /></label>
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">تجمیع آمار<select className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={groupBy} onChange={(event) => setGroupBy(event.target.value)}><option value="day">روزانه</option><option value="month">ماهانه</option></select></label>
        <button className="self-end rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60" type="submit" disabled={isLoading || !activeBranchId}>{isLoading ? 'در حال دریافت...' : 'اعمال بازه'}</button>
      </form>
      {error && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300" role="alert"><span>{error}</span><button className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-bold" onClick={loadReport} type="button">تلاش دوباره</button></div>}
      {isLoading && <p className="mb-4 rounded-xl bg-white p-4 text-sm text-slate-500 dark:bg-slate-900">در حال بارگذاری گزارش...</p>}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FiTrendingUp} label="مجموع فروش بازه" value={formatMoney(totals.totalSales)} hint="مبلغ فروش ثبت‌شده" />
        <StatCard icon={FiBarChart2} label="سود ناخالص" value={formatMoney(totals.totalProfit)} hint="بر پایه قیمت خرید ثبت‌شده" />
        <StatCard icon={FiPackage} label="تعداد کالاهای فروخته‌شده" value={digits.format(totals.totalItemsSold || 0)} hint="جمع تعداد اقلام" />
        <StatCard icon={FiFileText} label="تعداد فروش‌ها" value={digits.format(totals.salesCount || 0)} hint="تراکنش‌های ثبت‌شده" />
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-800"><FiCalendar /><h2 className="text-sm font-extrabold">جزئیات {groupBy === 'day' ? 'روزانه' : 'ماهانه'}</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-right text-xs"><thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400"><tr>{['بازه','فروش','سود','تعداد اقلام','تعداد فروش'].map((item) => <th className="px-4 py-3 font-bold" key={item}>{item}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-t border-slate-100 dark:border-slate-800" key={row.period}><td className="px-4 py-3 font-bold">{row.period}</td><td className="px-4 py-3">{formatMoney(row.totalSales)}</td><td className="px-4 py-3 text-emerald-700 dark:text-emerald-400">{formatMoney(row.totalProfit)}</td><td className="px-4 py-3">{digits.format(row.totalItemsSold || 0)}</td><td className="px-4 py-3">{digits.format(row.salesCount || 0)}</td></tr>)}{!rows.length && !isLoading && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={5}>در این بازه اطلاعاتی ثبت نشده است.</td></tr>}</tbody></table></div></section>
      {allBranches && <section className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/30"><h2 className="text-sm font-extrabold">خلاصه همه شعبه‌ها در ماه جاری</h2><p className="mt-3 text-xs text-slate-600 dark:text-slate-300">فروش: {formatMoney(adminTotals.totalSales)} · سود: {formatMoney(adminTotals.totalProfit)} · تعداد فروش: {digits.format(adminTotals.salesCount || 0)}</p></section>}
    </>}
  </main></div></div></div>;
}
