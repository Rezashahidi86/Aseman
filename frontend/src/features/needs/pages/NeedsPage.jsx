import { useCallback, useEffect, useState } from 'react';
import { FiAlertTriangle, FiClipboard, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';
import { getNeeds, createNeed, deleteNeed } from '../../../api/services/needService.js';
import { getProducts } from '../../../api/services/dashboardService.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';
import { showError, showSuccess } from '../../../shared/utils/notifications.js';

const statusLabels = { PENDING: 'در انتظار', FULFILLED: 'تأمین‌شده', REJECTED: 'ردشده' };
const number = new Intl.NumberFormat('fa-IR');
const pageSizes = [10, 20, 50];

function Pagination({ page, limit, total, totalPages, onPageChange, onLimitChange, label }) {
  if (!total) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400">
      <span>نمایش {number.format((page - 1) * limit + 1)} تا {number.format(Math.min(page * limit, total))} از {number.format(total)} {label}</span>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2">تعداد در صفحه
          <select value={limit} onChange={(event) => onLimitChange(Number(event.target.value))} className="min-h-9 rounded-lg border bg-white px-2 dark:border-slate-700 dark:bg-slate-950">
            {pageSizes.map((size) => <option key={size} value={size}>{number.format(size)}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="min-h-9 rounded-lg border px-3 disabled:opacity-40 dark:border-slate-700">قبلی</button>
        <span>صفحه {number.format(page)} از {number.format(Math.max(totalPages, 1))}</span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="min-h-9 rounded-lg border px-3 disabled:opacity-40 dark:border-slate-700">بعدی</button>
      </div>
    </div>
  );
}

function EmptyRow({ colSpan, children }) {
  return <tr><td colSpan={colSpan} className="p-8 text-center text-xs text-slate-500">{children}</td></tr>;
}

export function NeedsPage() {
  const { user } = useAuth();
  const { activeBranch, activeBranchId } = useActiveBranch();
  const isAdmin = user?.role === 'ADMIN';
  const branchRequired = isAdmin && !activeBranchId;

  const [needs, setNeeds] = useState([]);
  const [needsPagination, setNeedsPagination] = useState({ total: 0, totalPages: 0 });
  const [needsPage, setNeedsPage] = useState(1);
  const [needsLimit, setNeedsLimit] = useState(10);
  const [status, setStatus] = useState('');

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockPagination, setLowStockPagination] = useState({ total: 0, totalPages: 0 });
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockLimit, setLowStockLimit] = useState(10);

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogPagination, setCatalogPagination] = useState({ total: 0, totalPages: 0 });
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogLimit, setCatalogLimit] = useState(10);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [appliedCatalogSearch, setAppliedCatalogSearch] = useState('');

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loadingNeeds, setLoadingNeeds] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadNeeds = useCallback(async () => {
    if (branchRequired) {
      setNeeds([]);
      setNeedsPagination({ total: 0, totalPages: 0 });
      return;
    }
    setLoadingNeeds(true);
    setError('');
    try {
      const response = await getNeeds({ ...(activeBranchId ? { branchId: activeBranchId } : {}), page: needsPage, limit: needsLimit, ...(status ? { status } : {}) });
      setNeeds(response?.data?.needs || []);
      setNeedsPagination({ total: Number(response?.pagination?.total) || 0, totalPages: Number(response?.pagination?.totalPages) || 0 });
    } catch (loadError) {
      setError(loadError.message || 'دریافت نیازهای دستی ناموفق بود.');
    } finally {
      setLoadingNeeds(false);
    }
  }, [activeBranchId, branchRequired, needsPage, needsLimit, status]);

  const loadLowStock = useCallback(async () => {
    if (branchRequired) {
      setLowStockProducts([]);
      setLowStockPagination({ total: 0, totalPages: 0 });
      return;
    }
    setLoadingLowStock(true);
    try {
      const response = await getProducts({ ...(activeBranchId ? { branchId: activeBranchId } : {}), stock: 'low', page: lowStockPage, limit: lowStockLimit });
      setLowStockProducts(response?.data?.products || []);
      setLowStockPagination({ total: Number(response?.pagination?.total) || 0, totalPages: Number(response?.pagination?.totalPages) || 0 });
    } catch (loadError) {
      setError(loadError.message || 'دریافت کالاهای کم‌موجود ناموفق بود.');
    } finally {
      setLoadingLowStock(false);
    }
  }, [activeBranchId, branchRequired, lowStockPage, lowStockLimit]);

  const loadCatalog = useCallback(async () => {
    if (branchRequired) {
      setCatalogProducts([]);
      setCatalogPagination({ total: 0, totalPages: 0 });
      return;
    }
    setLoadingCatalog(true);
    try {
      const response = await getProducts({
        ...(activeBranchId ? { branchId: activeBranchId } : {}),
        page: catalogPage,
        limit: catalogLimit,
        ...(appliedCatalogSearch ? { name: appliedCatalogSearch } : {}),
        sort: 'name',
      });
      const list = response?.data?.products || [];
      setCatalogProducts(list);
      setCatalogPagination({ total: Number(response?.pagination?.total) || 0, totalPages: Number(response?.pagination?.totalPages) || 0 });
      setProductId((current) => current || list[0]?._id || '');
    } catch (loadError) {
      setError(loadError.message || 'دریافت کاتالوگ کالا ناموفق بود.');
    } finally {
      setLoadingCatalog(false);
    }
  }, [activeBranchId, branchRequired, catalogPage, catalogLimit, appliedCatalogSearch]);

  useEffect(() => { loadNeeds(); }, [loadNeeds]);
  useEffect(() => { loadLowStock(); }, [loadLowStock]);
  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  const refreshAll = () => { loadNeeds(); loadLowStock(); loadCatalog(); };

  const submit = async (event) => {
    event.preventDefault();
    if (!productId) return showError('ابتدا یک کالا از کاتالوگ انتخاب کنید.');
    setSaving(true);
    try {
      await createNeed({ productId, requestedQuantity: Number(quantity), ...(activeBranchId ? { branchId: activeBranchId } : {}) });
      setQuantity('1');
      setNeedsPage(1);
      await loadNeeds();
      showSuccess('نیاز دستی ثبت شد.');
    } catch (submitError) {
      showError(submitError.message || 'ثبت نیاز ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const confirm = async (id) => {
    try {
      await deleteNeed(id, activeBranchId ? { branchId: activeBranchId } : {});
      await loadNeeds();
      showSuccess('نیاز تأیید و از فهرست حذف شد.');
    } catch (confirmError) {
      showError(confirmError.message || 'تأیید نیاز ناموفق بود.');
    }
  };

  const chooseLowStockProduct = (product) => {
    setProductId(product._id);
    setCatalogSearch(product.name);
    setAppliedCatalogSearch(product.name);
    setCatalogPage(1);
    setQuantity(String(Math.max(1, Number(product.minimumStock || 0) - Number(product.quantity || 0))));
    document.getElementById('manual-need-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div><h1 className="text-2xl font-extrabold">مدیریت نیازمندی‌ها</h1><p className="mt-2 text-xs text-slate-500">نیازهای خودکار انبار و درخواست‌های دستی، به‌صورت جداگانه</p></div>
              <button type="button" onClick={refreshAll} disabled={loadingNeeds || loadingLowStock || loadingCatalog} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-xs disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"><FiRefreshCw /> تازه‌سازی</button>
            </header>

            {branchRequired ? (
              <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900"><h2 className="font-bold">ابتدا شعبه فعال را انتخاب کنید</h2><p className="mt-2 text-xs text-slate-500">اطلاعات مدیر بر اساس شعبه انتخاب‌شده نمایش داده می‌شود.</p></div>
            ) : (
              <>
                {error && <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"><span>{error}</span><button type="button" onClick={refreshAll} className="shrink-0 underline">تلاش دوباره</button></div>}

                <section className="mb-8 overflow-hidden rounded-2xl border border-amber-200 bg-white dark:border-amber-900/70 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"><FiAlertTriangle size={20} /></span><div><h2 className="font-extrabold">۱. نیازهای خودکار انبار</h2><p className="mt-1 text-xs text-slate-500">محصولاتی که موجودی آن‌ها به حداقل موجودی یا کمتر رسیده است.</p></div></div>
                    <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-amber-800 dark:bg-slate-900 dark:text-amber-300">{number.format(lowStockPagination.total)} کالا</span>
                  </div>
                  <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950"><tr>{['کالا','بارکد','موجودی','حداقل موجودی','وضعیت','اقدام'].map((heading) => <th key={heading} className="p-4">{heading}</th>)}</tr></thead>
                    <tbody>
                      {lowStockProducts.map((product) => <tr key={product._id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-4 font-bold">{product.name}</td><td className="p-4">{product.barcode}</td><td className="p-4 font-bold text-rose-600">{number.format(product.quantity)}</td><td className="p-4">{number.format(product.minimumStock)}</td><td className="p-4"><span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700 dark:bg-rose-950 dark:text-rose-300">کم‌موجود</span></td><td className="p-4"><button type="button" onClick={() => chooseLowStockProduct(product)} className="rounded-lg bg-indigo-600 px-3 py-2 font-bold text-white">ثبت درخواست دستی</button></td></tr>)}
                      {!lowStockProducts.length && !loadingLowStock && <EmptyRow colSpan={6}>در این شعبه کالای کم‌موجودی وجود ندارد.</EmptyRow>}
                      {loadingLowStock && <EmptyRow colSpan={6}>در حال دریافت موجودی...</EmptyRow>}
                    </tbody>
                  </table></div>
                  <Pagination page={lowStockPage} limit={lowStockLimit} total={lowStockPagination.total} totalPages={lowStockPagination.totalPages} onPageChange={setLowStockPage} onLimitChange={(value) => { setLowStockLimit(value); setLowStockPage(1); }} label="کالا" />
                </section>

                <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/50"><div><h2 className="flex items-center gap-2 text-lg font-extrabold"><FiClipboard /> ۲. نیازهای دستی</h2><p className="mt-1 text-xs leading-6 text-slate-500">درخواست خرید را ثبت کنید و پس از تأمین، با یک کلیک آن را تأیید کنید. درخواست تأییدشده از دیتابیس حذف می‌شود.</p></div><span className="rounded-xl border border-indigo-100 bg-white px-4 py-2 text-sm font-bold text-indigo-700 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300">{number.format(needsPagination.total)} درخواست باز</span></div>
                  <form id="manual-need-form" onSubmit={submit} className="grid gap-5 border-b border-slate-100 bg-white p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_180px] dark:border-slate-800 dark:bg-slate-900">
                    <div className="min-w-0">
                      <label htmlFor="need-product" className="mb-2 block text-sm font-bold">انتخاب کالا <span className="text-rose-500">*</span></label>
                      <select id="need-product" required value={productId} onChange={(event) => setProductId(event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"><option value="">انتخاب کالا</option>{catalogProducts.map((product) => <option key={product._id} value={product._id}>{product.name} · {product.barcode}</option>)}</select>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="نام کالا را جست‌وجو کنید..." className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" /><button type="button" onClick={() => { setCatalogPage(1); setAppliedCatalogSearch(catalogSearch.trim()); setProductId(''); }} className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">جست‌وجو در کاتالوگ</button></div><p className="mt-2 text-xs text-slate-500">{number.format(catalogPagination.total)} کالا مطابق کاتالوگ</p>
                      <Pagination page={catalogPage} limit={catalogLimit} total={catalogPagination.total} totalPages={catalogPagination.totalPages} onPageChange={(value) => { setCatalogPage(value); setProductId(''); }} onLimitChange={(value) => { setCatalogLimit(value); setCatalogPage(1); setProductId(''); }} label="کالا" />
                      {loadingCatalog && <p className="mt-2 text-[11px] text-slate-500">در حال دریافت کاتالوگ...</p>}
                    </div>
                    <label className="text-sm font-bold">تعداد موردنیاز <span className="text-rose-500">*</span><input type="number" min="1" step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" /><span className="mt-2 block text-xs font-normal text-slate-500">تعداد باید عدد صحیح و حداقل ۱ باشد.</span></label>
                    <div className="flex flex-wrap items-end gap-3 lg:col-span-2"><button type="submit" disabled={saving || !productId || loadingCatalog} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"><FiPlus />{saving ? 'در حال ثبت...' : 'ثبت درخواست نیاز'}</button><span className="pb-1 text-xs text-slate-500">پس از ثبت، درخواست در فهرست پایین نمایش داده می‌شود.</span></div>
                  </form>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800"><div className="flex flex-wrap items-center gap-3"><label className="text-xs font-bold">فیلتر درخواست‌ها<select value={status} onChange={(event) => { setStatus(event.target.value); setNeedsPage(1); }} className="mr-2 min-h-10 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="">همه وضعیت‌ها</option><option value="PENDING">در انتظار</option></select></label><span className="text-xs text-slate-500">{activeBranch?.name ? 'شعبه: ' + activeBranch.name : 'شعبه من'}</span></div><span className="text-xs text-slate-500">برای بستن درخواست، آن را تأیید کنید.</span></div>
                  <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950"><tr>{['کالا','تعداد موردنیاز','ثبت‌کننده','تاریخ ثبت','وضعیت','اقدام'].map((heading) => <th key={heading} className="p-4">{heading}</th>)}</tr></thead>
                    <tbody>
                      {needs.map((need) => <tr key={need._id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-4 font-bold">{need.productName || need.product?.name}</td><td className="p-4">{number.format(need.requestedQuantity)}</td><td className="p-4">{need.createdBy?.name || '—'}</td><td className="p-4">{new Date(need.createdAt).toLocaleDateString('fa-IR')}</td><td className="p-4">{statusLabels[need.status] || need.status}</td><td className="p-4"><button type="button" onClick={() => confirm(need._id)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white transition hover:bg-emerald-700"><span>✓</span> تأیید و حذف</button></td></tr>)}
                      {!needs.length && !loadingNeeds && <EmptyRow colSpan={6}>درخواستی برای این فیلتر ثبت نشده است.</EmptyRow>}
                      {loadingNeeds && <EmptyRow colSpan={6}>در حال دریافت درخواست‌ها...</EmptyRow>}
                    </tbody>
                  </table></div>
                  <Pagination page={needsPage} limit={needsLimit} total={needsPagination.total} totalPages={needsPagination.totalPages} onPageChange={setNeedsPage} onLimitChange={(value) => { setNeedsLimit(value); setNeedsPage(1); }} label="درخواست" />
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
