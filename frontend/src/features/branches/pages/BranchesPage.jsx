import { useCallback, useEffect, useState } from 'react';
import { FiMapPin, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { createBranch, getBranches, updateBranchStatus } from '../../../api/services/branchService.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';
import { confirmWithToast, showError, showSuccess } from '../../../shared/utils/notifications.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';
import { formatNumber } from '../../../shared/utils/format.js';

const EMPTY_FORM = { name: '', code: '' };

export function BranchesPage() {
  const { user } = useAuth();
  const { reloadBranches } = useActiveBranch();
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingBranchId, setUpdatingBranchId] = useState('');
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'ADMIN';

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

  const handleCreateBranch = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
    };

    if (!payload.name || !payload.code) {
      showError('نام و کد شعبه را وارد کنید.');
      return;
    }

    setIsSaving(true);
    try {
      await createBranch(payload);
      setForm(EMPTY_FORM);
      setIsFormOpen(false);
      showSuccess('شعبه با موفقیت ایجاد شد.');
      await Promise.all([loadBranches(), reloadBranches()]);
    } catch (requestError) {
      showError(requestError.message || 'ایجاد شعبه ناموفق بود.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = (branch) => {
    const nextIsActive = !branch.isActive;
    confirmWithToast({
      message: nextIsActive
        ? `شعبه «${branch.name}» فعال شود؟`
        : `شعبه «${branch.name}» غیرفعال شود؟`,
      confirmLabel: nextIsActive ? 'فعال کردن' : 'غیرفعال کردن',
      type: nextIsActive ? 'success' : 'error',
      onConfirm: async () => {
        setUpdatingBranchId(branch._id);
        try {
          await updateBranchStatus(branch._id, nextIsActive);
          showSuccess(nextIsActive ? 'شعبه فعال شد.' : 'شعبه غیرفعال شد.');
          await Promise.all([loadBranches(), reloadBranches()]);
        } catch (requestError) {
          showError(requestError.message || 'تغییر وضعیت شعبه ناموفق بود.');
        } finally {
          setUpdatingBranchId('');
        }
      },
    });
  };

  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl"><div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]"><DashboardSidebar /><div className="min-w-0"><DashboardHeader /><main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="mb-2 text-xs text-slate-500 dark:text-slate-400">ساختار سازمان</p><h1 className="text-2xl font-extrabold">شعبه‌ها</h1><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{isAdmin ? 'مدیریت شعبه‌ها، ایجاد شعبه و کنترل وضعیت آن‌ها' : 'اطلاعات شعبه اختصاص‌یافته به حساب شما'}</p></div><div className="flex flex-wrap gap-2"><button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900" type="button" onClick={loadBranches} disabled={isLoading}><FiRefreshCw size={15} /> تازه‌سازی</button>{isAdmin && <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50" type="button" onClick={() => { setForm(EMPTY_FORM); setIsFormOpen((value) => !value); }}><FiPlus size={15} /> ایجاد شعبه</button>}</div></div>
    {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300" role="alert">{error}<button className="mr-3 underline" type="button" onClick={loadBranches}>تلاش دوباره</button></div>}
    {isAdmin && isFormOpen && <form className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-indigo-200 bg-white p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] dark:border-indigo-900 dark:bg-slate-900" onSubmit={handleCreateBranch}><label className="text-xs font-bold">نام شعبه<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="مثلاً شعبه مرکزی" maxLength={100} required /></label><label className="text-xs font-bold">کد شعبه<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase dark:border-slate-700 dark:bg-slate-950" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="مثلاً BR004" maxLength={20} required dir="ltr" /></label><div className="flex items-end gap-2"><button className="min-h-11 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white disabled:opacity-50" type="submit" disabled={isSaving}>{isSaving ? 'در حال ثبت...' : 'ثبت شعبه'}</button><button className="min-h-11 rounded-xl border border-slate-200 px-4 text-xs font-bold dark:border-slate-700" type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving}>انصراف</button></div></form>}
    {isLoading ? <p className="rounded-xl bg-white p-5 text-sm text-slate-500 dark:bg-slate-900">در حال بارگذاری...</p> : <><div className="mb-4 text-xs text-slate-500 dark:text-slate-400">{formatNumber(branches.length)} شعبه قابل مشاهده</div><section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{branches.map((branch) => <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" key={branch._id}><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><FiMapPin size={20} /></span><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${branch.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{branch.isActive ? 'فعال' : 'غیرفعال'}</span></div><h2 className="mt-4 text-base font-extrabold">{branch.name}</h2><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">کد شعبه: <strong className="text-slate-700 dark:text-slate-200" dir="ltr">{branch.code}</strong></p>{branch.createdAt && <p className="mt-1 text-[11px] text-slate-400">تاریخ ایجاد: {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(branch.createdAt))}</p>}{isAdmin && <button className={`mt-4 min-h-10 w-full rounded-xl border px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${branch.isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/30'}`} type="button" onClick={() => handleToggleStatus(branch)} disabled={updatingBranchId === branch._id}>{updatingBranchId === branch._id ? 'در حال تغییر...' : branch.isActive ? 'غیرفعال کردن شعبه' : 'فعال کردن شعبه'}</button>}</article>)}{!branches.length && <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">شعبه‌ای برای نمایش وجود ندارد.</div>}</section></>}
  </main></div></div></div>;
}
