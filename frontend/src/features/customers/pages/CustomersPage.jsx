import { useCallback, useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiTrash2, FiEdit2, FiRefreshCw } from 'react-icons/fi';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../../api/services/customerService.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';
import { showError, showSuccess, confirmWithToast } from '../../../shared/utils/notifications.js';

const emptyForm = { name: '', phone: '' };
export function CustomersPage() {
  const { activeBranchId } = useActiveBranch();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await getCustomers({ search: search.trim() || undefined, branchId: activeBranchId || undefined, limit: 100 });
      setCustomers(response?.data?.customers || []);
    } catch (err) { setError(err.message || 'دریافت مشتریان ناموفق بود.'); }
    finally { setLoading(false); }
  }, [activeBranchId, search]);
  useEffect(() => { load(); }, [load]);

  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      if (editingId) await updateCustomer(editingId, form, activeBranchId ? { branchId: activeBranchId } : {});
      else await createCustomer({ ...form, ...(activeBranchId ? { branchId: activeBranchId } : {}) });
      setForm(emptyForm); setEditingId(''); await load(); showSuccess(editingId ? 'اطلاعات مشتری ویرایش شد.' : 'مشتری ثبت شد.');
    } catch (err) { showError(err.message || 'ذخیره مشتری ناموفق بود.'); }
    finally { setSaving(false); }
  };
  const remove = (customer) => confirmWithToast({ message: `مشتری «${customer.name}» حذف شود؟`, confirmLabel: 'حذف مشتری', type: 'error', onConfirm: async () => { try { await deleteCustomer(customer._id, activeBranchId ? { branchId: activeBranchId } : {}); await load(); showSuccess('مشتری حذف شد.'); } catch (err) { showError(err.message); } } });

  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl"><div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]"><DashboardSidebar /><div className="min-w-0"><DashboardHeader /><main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8"><header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold">مشتریان</h1><p className="mt-2 text-xs text-slate-500">مدیریت مشتریان شعبه برای ارتباط و اطلاع‌رسانی</p></div><button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-900"><FiRefreshCw /> تازه‌سازی</button></header>
  <form onSubmit={submit} className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900"><label className="text-xs font-bold">نام مشتری<input required maxLength={100} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700" /></label><label className="text-xs font-bold">شماره تماس<input required inputMode="numeric" pattern="09[0-9]{9}" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700" /></label><div className="flex items-end gap-2"><button disabled={saving} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white disabled:opacity-50"><FiPlus /> {saving?'در حال ذخیره...':editingId?'ذخیره ویرایش':'ثبت مشتری'}</button>{editingId&&<button type="button" onClick={()=>{setEditingId('');setForm(emptyForm)}} className="min-h-11 rounded-xl border px-3 text-xs">لغو</button>}</div></form>
  <div className="mb-4 flex gap-2"><div className="relative flex-1"><FiSearch className="absolute right-3 top-3.5 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جست‌وجو بر اساس نام یا شماره تماس" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-3 text-sm dark:border-slate-800 dark:bg-slate-900" /></div></div>
  {error&&<p role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error} <button onClick={load} className="mr-2 underline">تلاش دوباره</button></p>}
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full min-w-[500px] text-right text-xs"><thead className="bg-slate-50 dark:bg-slate-950"><tr><th className="p-4">نام</th><th className="p-4">شماره تماس</th><th className="p-4">عملیات</th></tr></thead><tbody>{customers.map(customer=><tr key={customer._id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-4 font-bold">{customer.name}</td><td className="p-4" dir="ltr">{customer.phone}</td><td className="p-4"><div className="flex gap-2"><button aria-label="ویرایش مشتری" onClick={()=>{setEditingId(customer._id);setForm({name:customer.name,phone:customer.phone})}} className="rounded-lg border p-2"><FiEdit2/></button><button aria-label="حذف مشتری" onClick={()=>remove(customer)} className="rounded-lg border border-rose-200 p-2 text-rose-600"><FiTrash2/></button></div></td></tr>)}{!customers.length&&!loading&&<tr><td colSpan="3" className="p-8 text-center text-slate-500">مشتری‌ای پیدا نشد.</td></tr>}</tbody></table>{loading&&<p className="p-4 text-xs text-slate-500">در حال دریافت مشتریان...</p>}</div></main></div></div></div>;
}
