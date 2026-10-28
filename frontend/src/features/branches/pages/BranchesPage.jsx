import { useCallback, useEffect, useState } from 'react';
import { FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { getBranches } from '../../../api/services/branchService.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';

const digits = new Intl.NumberFormat('fa-IR');

export function BranchesPage() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBranches = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getBranches();
      setBranches(response?.data?.branches || []);
    } catch (requestError) {
      setError(requestError.message || 'دریافت شعبه‌ها ناموفق بود.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadBranches(); }, [loadBranches]);

  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl"><div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]"><DashboardSidebar /><div className="min-w-0"><DashboardHeader /><main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="mb-2 text-xs text-slate-500 dark:text-slate-400">ساختار سازمان</p><h1 className="text-2xl font-extrabold">شعبه‌ها</h1><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{user?.role === 'ADMIN' ? 'فهرست شعبه‌های سامانه' : 'اطلاعات شعبه اختصاص‌یافته به حساب شما'}</p></div><button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900" type="button" onClick={loadBranches} disabled={isLoading}><FiRefreshCw size={15} /> تازه‌سازی</button></div>
    {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300" role="alert">{error}</div>}
    {isLoading ? <p className="rounded-xl bg-white p-5 text-sm text-slate-500 dark:bg-slate-900">در حال بارگذاری...</p> : <><div className="mb-4 text-xs text-slate-500 dark:text-slate-400">{digits.format(branches.length)} شعبه قابل مشاهده</div><section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{branches.map((branch) => <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" key={branch._id}><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><FiMapPin size={20} /></span><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${branch.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{branch.isActive ? 'فعال' : 'غیرفعال'}</span></div><h2 className="mt-4 text-base font-extrabold">{branch.name}</h2><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">کد شعبه: <strong className="text-slate-700 dark:text-slate-200">{branch.code}</strong></p>{branch.createdAt && <p className="mt-1 text-[11px] text-slate-400">تاریخ ایجاد: {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(branch.createdAt))}</p>}</article>)}{!branches.length && <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">شعبه‌ای برای نمایش وجود ندارد.</div>}</section></>}
  </main></div></div></div>;
}
