import { useCallback, useEffect, useState } from 'react';
import { FiUserPlus, FiUsers, FiUserCheck } from 'react-icons/fi';
import { getUsers, createSeller, deactivateUser, activateUser } from '../../../api/services/userService.js';
import { getBranches } from '../../../api/services/branchService.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { confirmWithToast, showError, showSuccess } from '../../../shared/utils/notifications.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';

const digits = new Intl.NumberFormat('fa-IR');

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', branch: '' });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [userResponse, branchResponse] = await Promise.all([getUsers(), getBranches()]);
      setUsers(userResponse?.data?.users || []);
      setBranches((branchResponse?.data?.branches || []).filter((branch) => branch.isActive));
    } catch (requestError) {
      setError(requestError.message || 'دریافت کاربران ناموفق بود.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.branch) {
      showError('برای فروشنده یک شعبه انتخاب کنید.');
      return;
    }
    setIsSaving(true);
    try {
      await createSeller(form);
      setForm({ name: '', email: '', password: '', branch: '' });
      setIsFormOpen(false);
      showSuccess('حساب فروشنده ساخته شد.');
      await loadData();
    } catch (requestError) {
      showError(requestError.message || 'ساخت کاربر ناموفق بود.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = (target) => confirmWithToast({
    message: `حساب «${target.name}» غیرفعال شود؟`,
    confirmLabel: 'غیرفعال‌کردن',
    type: 'error',
    onConfirm: async () => {
      try {
        await deactivateUser(target._id);
        showSuccess('حساب کاربر غیرفعال شد.');
        await loadData();
      } catch (requestError) {
        showError(requestError.message || 'غیرفعال‌سازی کاربر ناموفق بود.');
      }
    },
  });

  const handleActivate = async (target) => {
    try {
      await activateUser(target._id);
      showSuccess('حساب کاربر فعال شد.');
      await loadData();
    } catch (requestError) {
      showError(requestError.message || 'فعال‌سازی کاربر ناموفق بود.');
    }
  };

  if (user?.role !== 'ADMIN') return <div className="p-8 text-sm" dir="rtl">این بخش فقط برای مدیر سامانه قابل دسترسی است.</div>;

  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl"><div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]"><DashboardSidebar /><div className="min-w-0"><DashboardHeader /><main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="mb-2 text-xs text-slate-500 dark:text-slate-400">مدیریت دسترسی</p><h1 className="text-2xl font-extrabold">کاربران</h1><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">ایجاد حساب فروشنده و غیرفعال‌سازی دسترسی</p></div><button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700" type="button" onClick={() => setIsFormOpen((value) => !value)}><FiUserPlus size={16} /> {isFormOpen ? 'بستن فرم' : 'ایجاد فروشنده'}</button></div>
    {isFormOpen && <form className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-5 dark:border-slate-800 dark:bg-slate-900" onSubmit={handleCreate}><label className="text-xs font-bold">نام<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required maxLength={120} /></label><label className="text-xs font-bold">ایمیل<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required autoComplete="off" /></label><label className="text-xs font-bold">رمز عبور<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} required minLength={8} autoComplete="new-password" /></label><label className="text-xs font-bold">شعبه<select className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.branch} onChange={(e) => setForm((s) => ({ ...s, branch: e.target.value }))} required><option value="">انتخاب شعبه</option>{branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}</select></label><button className="self-end rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white disabled:opacity-50" type="submit" disabled={isSaving || !branches.length}>{isSaving ? 'در حال ثبت...' : 'ثبت فروشنده'}</button></form>}
    {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300" role="alert">{error}<button className="mr-3 underline" type="button" onClick={loadData}>تلاش دوباره</button></div>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-800"><FiUsers /><h2 className="text-sm font-extrabold">فهرست کاربران ({digits.format(users.length)})</h2></div>{isLoading ? <p className="p-6 text-sm text-slate-500">در حال دریافت کاربران...</p> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-right text-xs"><thead className="bg-slate-50 text-slate-500 dark:bg-slate-950"><tr>{['نام','ایمیل','نقش','شعبه','وضعیت','عملیات'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{users.map((item) => <tr key={item._id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-3 font-bold">{item.name}</td><td className="px-4 py-3" dir="ltr">{item.email}</td><td className="px-4 py-3">{item.role === 'ADMIN' ? 'مدیر' : 'فروشنده'}</td><td className="px-4 py-3">{item.branch?.name || '—'}</td><td className="px-4 py-3"><span className={item.isActive ? 'text-emerald-600' : 'text-slate-400'}>{item.isActive ? 'فعال' : 'غیرفعال'}</span></td><td className="px-4 py-3">{item.role !== 'ADMIN' && (item.isActive ? <button className="rounded-lg border border-rose-200 px-3 py-2 font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950" type="button" onClick={() => handleDeactivate(item)}>غیرفعال‌کردن</button> : <button className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950" type="button" onClick={() => handleActivate(item)}><FiUserCheck size={14} /> فعال‌کردن</button>)}</td></tr>)}{!users.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">کاربری ثبت نشده است.</td></tr>}</tbody></table></div>}</section>
  </main></div></div></div>;
}
