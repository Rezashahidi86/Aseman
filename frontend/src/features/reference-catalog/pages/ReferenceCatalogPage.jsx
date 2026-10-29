import { useCallback, useEffect, useState } from 'react';
import { FiBookOpen, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { ProductPagination } from '../../products/components/ProductPagination.jsx';
import { createReferenceItem, deleteReferenceItem, getReferenceCatalog, updateReferenceItem } from '../../../api/services/referenceCatalogService.js';
import { confirmWithToast, showError, showSuccess } from '../../../shared/utils/notifications.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';

const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const EMPTY = { name: '', barcode: '', purchasePrice: '', salePrice: '' };
const formatMoney = (value) => `${money.format(Number(value) || 0)} تومان`;

export function ReferenceCatalogPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadItems = useCallback(async (query = appliedSearch, requestedPage = page, requestedLimit = limit) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getReferenceCatalog({ page: requestedPage, limit: requestedLimit, search: query || undefined });
      const nextPagination = response?.pagination || { page: requestedPage, limit: requestedLimit, total: 0, totalPages: 0 };
      if (requestedPage > Math.max(nextPagination.totalPages, 1)) {
        setPage(Math.max(nextPagination.totalPages, 1));
        return;
      }
      setItems(response?.data?.items || []);
      setPagination(nextPagination);
    } catch (requestError) {
      setError(requestError.message || 'دریافت کاتالوگ مرجع ناموفق بود.');
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearch, page, limit]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const openCreate = () => {
    setEditingId('');
    setForm(EMPTY);
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name || '', barcode: item.barcode || '', purchasePrice: String(item.purchasePrice ?? ''), salePrice: String(item.salePrice ?? '') });
    setIsFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { name: form.name.trim(), purchasePrice: Number(form.purchasePrice), salePrice: Number(form.salePrice) };
    if (form.barcode.trim()) payload.barcode = form.barcode.trim();
    if (!payload.name || !Number.isFinite(payload.purchasePrice) || !Number.isFinite(payload.salePrice) || payload.purchasePrice < 0 || payload.salePrice < 0) {
      showError('نام و قیمت‌های معتبر و غیرمنفی وارد کنید.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) await updateReferenceItem(editingId, payload);
      else await createReferenceItem(payload);
      setIsFormOpen(false);
      setForm(EMPTY);
      setEditingId('');
      showSuccess(editingId ? 'کالای مرجع ویرایش شد.' : 'کالای مرجع اضافه شد.');
      const targetPage = editingId ? page : 1;
      if (!editingId) setPage(1);
      await loadItems(appliedSearch, targetPage, limit);
    } catch (requestError) {
      showError(requestError.message || 'ذخیره کالای مرجع ناموفق بود.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (item) => confirmWithToast({
    message: `کالای مرجع «${item.name}» حذف شود؟`,
    confirmLabel: 'حذف',
    type: 'error',
    onConfirm: async () => {
      try {
        await deleteReferenceItem(item._id);
        showSuccess('کالای مرجع حذف شد.');
        await loadItems();
      } catch (requestError) {
        showError(requestError.message || 'حذف کالای مرجع ناموفق بود.');
      }
    },
  });

  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl"><div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]"><DashboardSidebar /><div className="min-w-0"><DashboardHeader /><main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="mb-2 text-xs text-slate-500 dark:text-slate-400">قیمت‌نامه مشترک</p><h1 className="text-2xl font-extrabold">کاتالوگ مرجع</h1><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">قیمت‌های مرجع مستقل از کالاهای موجودی هر شعبه هستند و تغییر آن‌ها قیمت شعبه را تغییر نمی‌دهد.</p></div><button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white" type="button" onClick={openCreate}><FiPlus size={16} /> کالای مرجع جدید</button></div>
    <form className="mb-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row dark:border-slate-800 dark:bg-slate-900" onSubmit={(event) => { event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); }}><label className="relative min-w-0 flex-1"><FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجو بر اساس نام یا بارکد" /></label><button className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white dark:bg-indigo-600" type="submit">جست‌وجو</button></form>
    {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300" role="alert">{error}<button className="mr-3 underline" type="button" onClick={() => loadItems()}>تلاش دوباره</button></div>}
    {isFormOpen && <form className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-indigo-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-5 dark:border-indigo-900 dark:bg-slate-900" onSubmit={handleSubmit}><label className="text-xs font-bold">نام کالا<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required maxLength={150} /></label><label className="text-xs font-bold">بارکد (اختیاری)<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.barcode} onChange={(e) => setForm((s) => ({ ...s, barcode: e.target.value }))} maxLength={100} /></label><label className="text-xs font-bold">قیمت خرید<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="number" min="0" step="any" value={form.purchasePrice} onChange={(e) => setForm((s) => ({ ...s, purchasePrice: e.target.value }))} required /></label><label className="text-xs font-bold">قیمت فروش<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="number" min="0" step="any" value={form.salePrice} onChange={(e) => setForm((s) => ({ ...s, salePrice: e.target.value }))} required /></label><div className="flex items-end gap-2"><button className="min-h-11 flex-1 rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white disabled:opacity-50" type="submit" disabled={isSaving}>{isSaving ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'ثبت کالا'}</button><button className="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold dark:border-slate-700" type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving}>انصراف</button></div></form>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-800"><FiBookOpen /><h2 className="text-sm font-extrabold">اقلام مرجع ({new Intl.NumberFormat('fa-IR').format(pagination.total)})</h2></div>{isLoading ? <p className="p-6 text-sm text-slate-500">در حال دریافت کاتالوگ...</p> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-right text-xs"><thead className="bg-slate-50 text-slate-500 dark:bg-slate-950"><tr>{['نام کالا','بارکد','قیمت خرید مرجع','قیمت فروش مرجع','عملیات'].map((label) => <th className="px-4 py-3" key={label}>{label}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-3 font-bold">{item.name}</td><td className="px-4 py-3" dir="ltr">{item.barcode || '—'}</td><td className="px-4 py-3">{formatMoney(item.purchasePrice)}</td><td className="px-4 py-3">{formatMoney(item.salePrice)}</td><td className="px-4 py-3"><div className="flex gap-2"><button className="rounded-lg border border-indigo-200 px-3 py-2 font-bold text-indigo-600 dark:border-indigo-900 dark:text-indigo-300" type="button" onClick={() => openEdit(item)}>ویرایش</button><button className="rounded-lg border border-rose-200 px-3 py-2 text-rose-600 dark:border-rose-900" type="button" onClick={() => handleDelete(item)} aria-label={`حذف ${item.name}`}><FiTrash2 size={15} /></button></div></td></tr>)}{!items.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">کالای مرجعی پیدا نشد.</td></tr>}</tbody></table></div>}</section>
    <div className="mt-4"><ProductPagination page={page} limit={limit} total={pagination.total} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(nextLimit) => { setLimit(nextLimit); setPage(1); }} /></div>
  </main></div></div></div>;
}
