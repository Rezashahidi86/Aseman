import { useCallback, useEffect, useState } from 'react';
import {
  FiAlertTriangle,
  FiClipboard,
  FiPlus,
  FiRefreshCw,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';
import {
  getNeeds,
  createNeed,
  deleteNeed,
} from '../../../api/services/needService.js';
import { getProducts } from '../../../api/services/dashboardService.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';
import { showError, showSuccess } from '../../../shared/utils/notifications.js';
import { formatNumber } from '../../../shared/utils/format.js';

const statusLabels = {
  PENDING: 'در انتظار',
  FULFILLED: 'تأمین‌شده',
  REJECTED: 'ردشده',
};
const pageSizes = [10, 20, 50];

function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  label,
}) {
  if (!total) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400">
      <span>
        نمایش {formatNumber((page - 1) * limit + 1)} تا{' '}
        {formatNumber(Math.min(page * limit, total))} از {formatNumber(total)}{' '}
        {label}
      </span>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2">
          تعداد در صفحه
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="min-h-9 rounded-lg border bg-white px-2 dark:border-slate-700 dark:bg-slate-950"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {formatNumber(size)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="min-h-9 rounded-lg border px-3 disabled:opacity-40 dark:border-slate-700"
        >
          قبلی
        </button>
        <span>
          صفحه {formatNumber(page)} از {formatNumber(Math.max(totalPages, 1))}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="min-h-9 rounded-lg border px-3 disabled:opacity-40 dark:border-slate-700"
        >
          بعدی
        </button>
      </div>
    </div>
  );
}

function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-8 text-center text-xs text-slate-500">
        {children}
      </td>
    </tr>
  );
}

export function NeedsPage() {
  const { user } = useAuth();
  const { activeBranch, activeBranchId } = useActiveBranch();
  const isAdmin = user?.role === 'ADMIN';
  const branchRequired = isAdmin && !activeBranchId;

  const [needs, setNeeds] = useState([]);
  const [needsPagination, setNeedsPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [needsPage, setNeedsPage] = useState(1);
  const [needsLimit, setNeedsLimit] = useState(10);
  const [status, setStatus] = useState('');
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockPagination, setLowStockPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockLimit, setLowStockLimit] = useState(10);

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogPagination, setCatalogPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogLimit, setCatalogLimit] = useState(10);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSearchType, setCatalogSearchType] = useState('name');
  const [appliedCatalogSearch, setAppliedCatalogSearch] = useState('');
  const [appliedCatalogSearchType, setAppliedCatalogSearchType] =
    useState('name');

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
      const response = await getNeeds({
        ...(activeBranchId ? { branchId: activeBranchId } : {}),
        page: needsPage,
        limit: needsLimit,
        ...(status ? { status } : {}),
      });
      setNeeds(response?.data?.needs || []);
      setNeedsPagination({
        total: Number(response?.pagination?.total) || 0,
        totalPages: Number(response?.pagination?.totalPages) || 0,
      });
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
      const response = await getProducts({
        ...(activeBranchId ? { branchId: activeBranchId } : {}),
        stock: 'low',
        page: lowStockPage,
        limit: lowStockLimit,
      });
      setLowStockProducts(response?.data?.products || []);
      setLowStockPagination({
        total: Number(response?.pagination?.total) || 0,
        totalPages: Number(response?.pagination?.totalPages) || 0,
      });
    } catch (loadError) {
      setError(loadError.message || 'دریافت کالاهای کم‌موجود ناموفق بود.');
    } finally {
      setLoadingLowStock(false);
    }
  }, [activeBranchId, branchRequired, lowStockPage, lowStockLimit]);

  const loadCatalog = useCallback(async () => {
    if (branchRequired || !appliedCatalogSearch) {
      setCatalogProducts([]);
      setCatalogPagination({ total: 0, totalPages: 0 });
      setLoadingCatalog(false);
      return;
    }
    setLoadingCatalog(true);
    try {
      const response = await getProducts({
        ...(activeBranchId ? { branchId: activeBranchId } : {}),
        page: catalogPage,
        limit: catalogLimit,
        [appliedCatalogSearchType === 'barcode' ? 'barcode' : 'name']:
          appliedCatalogSearch,
        sort: 'name',
      });
      const list = response?.data?.products || [];
      setCatalogProducts(list);
      setCatalogPagination({
        total: Number(response?.pagination?.total) || 0,
        totalPages: Number(response?.pagination?.totalPages) || 0,
      });
    } catch (loadError) {
      setError(loadError.message || 'جست‌وجوی کالا ناموفق بود.');
      setCatalogProducts([]);
      setCatalogPagination({ total: 0, totalPages: 0 });
    } finally {
      setLoadingCatalog(false);
    }
  }, [
    activeBranchId,
    branchRequired,
    catalogPage,
    catalogLimit,
    appliedCatalogSearch,
    appliedCatalogSearchType,
  ]);

  useEffect(() => {
    loadNeeds();
  }, [loadNeeds]);
  useEffect(() => {
    loadLowStock();
  }, [loadLowStock]);
  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const refreshAll = () => {
    loadNeeds();
    loadLowStock();
    loadCatalog();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!productId) return showError('ابتدا یک کالا از کاتالوگ انتخاب کنید.');
    setSaving(true);
    try {
      await createNeed({
        productId,
        requestedQuantity: Number(quantity),
        ...(activeBranchId ? { branchId: activeBranchId } : {}),
      });
      setQuantity('1');
      setProductId('');
      setIsNeedModalOpen(false);
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
    setCatalogSearchType('name');
    setAppliedCatalogSearch(product.name);
    setAppliedCatalogSearchType('name');
    setCatalogPage(1);
    setQuantity(
      String(
        Math.max(
          1,
          Number(product.minimumStock || 0) - Number(product.quantity || 0),
        ),
      ),
    );
    setIsNeedModalOpen(true);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      dir="rtl"
    >
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold">مدیریت نیازمندی‌ها</h1>
                <p className="mt-2 text-xs text-slate-500">
                  نیازهای خودکار انبار و درخواست‌های دستی، به‌صورت جداگانه
                </p>
              </div>
              <button
                type="button"
                onClick={refreshAll}
                disabled={loadingNeeds || loadingLowStock || loadingCatalog}
                className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-xs disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
              >
                <FiRefreshCw /> تازه‌سازی
              </button>
            </header>

            {branchRequired ? (
              <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                <h2 className="font-bold">ابتدا شعبه فعال را انتخاب کنید</h2>
                <p className="mt-2 text-xs text-slate-500">
                  اطلاعات مدیر بر اساس شعبه انتخاب‌شده نمایش داده می‌شود.
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div
                    role="alert"
                    className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
                  >
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={refreshAll}
                      className="shrink-0 underline"
                    >
                      تلاش دوباره
                    </button>
                  </div>
                )}

                <section className="mb-8 overflow-hidden rounded-2xl border border-amber-200 bg-white dark:border-amber-900/70 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        <FiAlertTriangle size={20} />
                      </span>
                      <div>
                        <h2 className="font-extrabold">
                          ۱. نیازهای خودکار انبار
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          محصولاتی که موجودی آن‌ها به حداقل موجودی یا کمتر رسیده
                          است.
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-amber-800 dark:bg-slate-900 dark:text-amber-300">
                      {formatNumber(lowStockPagination.total)} کالا
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-right text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950">
                        <tr>
                          {[
                            'کالا',
                            'بارکد',
                            'موجودی',
                            'حداقل موجودی',
                            'وضعیت',
                            'اقدام',
                          ].map((heading) => (
                            <th key={heading} className="p-4">
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.map((product) => (
                          <tr
                            key={product._id}
                            className="border-t border-slate-100 dark:border-slate-800"
                          >
                            <td className="p-4 font-bold">{product.name}</td>
                            <td className="p-4">{product.barcode}</td>
                            <td className="p-4 font-bold text-rose-600">
                              {formatNumber(product.quantity)}
                            </td>
                            <td className="p-4">
                              {formatNumber(product.minimumStock)}
                            </td>
                            <td className="p-4">
                              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                کم‌موجود
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => chooseLowStockProduct(product)}
                                className="rounded-lg bg-indigo-600 px-3 py-2 font-bold text-white"
                              >
                                ثبت درخواست دستی
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!lowStockProducts.length && !loadingLowStock && (
                          <EmptyRow colSpan={6}>
                            در این شعبه کالای کم‌موجودی وجود ندارد.
                          </EmptyRow>
                        )}
                        {loadingLowStock && (
                          <EmptyRow colSpan={6}>
                            در حال دریافت موجودی...
                          </EmptyRow>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={lowStockPage}
                    limit={lowStockLimit}
                    total={lowStockPagination.total}
                    totalPages={lowStockPagination.totalPages}
                    onPageChange={setLowStockPage}
                    onLimitChange={(value) => {
                      setLowStockLimit(value);
                      setLowStockPage(1);
                    }}
                    label="کالا"
                  />
                </section>

                <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/50">
                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-extrabold">
                        <FiClipboard /> ۲. نیازهای دستی
                      </h2>
                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        درخواست خرید را ثبت کنید و پس از تأمین، با یک کلیک آن را
                        تأیید کنید. درخواست تأییدشده از دیتابیس حذف می‌شود.
                      </p>
                    </div>
                    <span className="rounded-xl border border-indigo-100 bg-white px-4 py-2 text-sm font-bold text-indigo-700 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300">
                      {formatNumber(needsPagination.total)} درخواست باز
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsNeedModalOpen(true)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-700"
                    >
                      <FiPlus size={15} /> ثبت نیاز دستی
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-right text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950">
                        <tr>
                          {[
                            'کالا',
                            'تعداد موردنیاز',
                            'ثبت‌کننده',
                            'تاریخ ثبت',
                            'وضعیت',
                            'اقدام',
                          ].map((heading) => (
                            <th key={heading} className="p-4">
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {needs.map((need) => (
                          <tr
                            key={need._id}
                            className="border-t border-slate-100 dark:border-slate-800"
                          >
                            <td className="p-4 font-bold">
                              {need.productName || need.product?.name}
                            </td>
                            <td className="p-4">
                              {formatNumber(need.requestedQuantity)}
                            </td>
                            <td className="p-4">
                              {need.createdBy?.name || '—'}
                            </td>
                            <td className="p-4">
                              {new Date(need.createdAt).toLocaleDateString(
                                'fa-IR',
                              )}
                            </td>
                            <td className="p-4">
                              {statusLabels[need.status] || need.status}
                            </td>
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => confirm(need._id)}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white transition hover:bg-emerald-700"
                              >
                                <span>✓</span> تأیید و حذف
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!needs.length && !loadingNeeds && (
                          <EmptyRow colSpan={6}>
                            درخواستی برای این فیلتر ثبت نشده است.
                          </EmptyRow>
                        )}
                        {loadingNeeds && (
                          <EmptyRow colSpan={6}>
                            در حال دریافت درخواست‌ها...
                          </EmptyRow>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={needsPage}
                    limit={needsLimit}
                    total={needsPagination.total}
                    totalPages={needsPagination.totalPages}
                    onPageChange={setNeedsPage}
                    onLimitChange={(value) => {
                      setNeedsLimit(value);
                      setNeedsPage(1);
                    }}
                    label="درخواست"
                  />
                </section>
              </>
            )}
          </main>
        </div>
      </div>

      {isNeedModalOpen && !branchRequired && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving)
              setIsNeedModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="need-modal-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7 dark:border-slate-800 dark:bg-slate-900"
          >
            <header className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <FiClipboard size={18} />
                </span>
                <h2 id="need-modal-title" className="text-lg font-extrabold">
                  ثبت درخواست نیاز دستی
                </h2>
                <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  کالا را با نام یا بارکد جست‌وجو کنید و تعداد موردنیاز را وارد
                  کنید.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNeedModalOpen(false)}
                disabled={saving}
                aria-label="بستن پنجره"
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <FiX size={18} />
              </button>
            </header>
            <form
              id="manual-need-form"
              onSubmit={submit}
              className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px]"
            >
              <div className="min-w-0">
                <label
                  htmlFor="need-product-search"
                  className="mb-2 block text-sm font-bold"
                >
                  جست‌وجو و انتخاب کالا <span className="text-rose-500">*</span>
                </label>
                <div className="mb-3 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogSearchType('name');
                      setCatalogSearch('');
                      setAppliedCatalogSearch('');
                      setAppliedCatalogSearchType('name');
                      setCatalogPage(1);
                      setCatalogProducts([]);
                      setCatalogPagination({ total: 0, totalPages: 0 });
                      setProductId('');
                    }}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition ${catalogSearchType === 'name' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    نام کالا
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogSearchType('barcode');
                      setCatalogSearch('');
                      setAppliedCatalogSearch('');
                      setAppliedCatalogSearchType('barcode');
                      setCatalogPage(1);
                      setCatalogProducts([]);
                      setCatalogPagination({ total: 0, totalPages: 0 });
                      setProductId('');
                    }}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition ${catalogSearchType === 'barcode' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    بارکد
                  </button>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="need-product-search"
                    value={catalogSearch}
                    onChange={(event) => setCatalogSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        const query = catalogSearch.trim();
                        setCatalogPage(1);
                        setProductId('');
                        setAppliedCatalogSearch(query);
                        setAppliedCatalogSearchType(catalogSearchType);
                      }
                    }}
                    placeholder={
                      catalogSearchType === 'barcode'
                        ? 'بارکد کالا را وارد یا اسکن کنید...'
                        : 'نام کالا را وارد کنید...'
                    }
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogPage(1);
                      setProductId('');
                      setAppliedCatalogSearch(catalogSearch.trim());
                      setAppliedCatalogSearchType(catalogSearchType);
                    }}
                    disabled={!catalogSearch.trim() || loadingCatalog}
                    className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    جست‌وجو
                  </button>
                </div>
                {productId && (
                  <p className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    کالای انتخاب‌شده:{' '}
                    {catalogProducts.find(
                      (product) => product._id === productId,
                    )?.name ||
                      lowStockProducts.find(
                        (product) => product._id === productId,
                      )?.name ||
                      'کالای انتخاب‌شده'}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {appliedCatalogSearch
                    ? `${formatNumber(catalogPagination.total)} نتیجه برای جست‌وجو`
                    : 'برای انتخاب کالا، نام یا بارکد آن را جست‌وجو کنید.'}
                </p>
                {loadingCatalog && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    در حال جست‌وجوی کالا...
                  </p>
                )}
                {appliedCatalogSearch && !loadingCatalog && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    {catalogProducts.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => setProductId(product._id)}
                        className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 p-3 text-right last:border-b-0 hover:bg-indigo-50 dark:border-slate-800 dark:hover:bg-slate-800 ${productId === product._id ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-500 dark:bg-indigo-950/40' : ''}`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">
                            {product.name}
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-500">
                            بارکد: {product.barcode || '—'} · موجودی:{' '}
                            {formatNumber(product.quantity ?? 0)}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${productId === product._id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                        >
                          {productId === product._id ? 'انتخاب شد' : 'انتخاب'}
                        </span>
                      </button>
                    ))}
                    {!catalogProducts.length && (
                      <p className="p-4 text-center text-xs text-slate-500">
                        کالایی با این مشخصات پیدا نشد.
                      </p>
                    )}
                  </div>
                )}
                <Pagination
                  page={catalogPage}
                  limit={catalogLimit}
                  total={catalogPagination.total}
                  totalPages={catalogPagination.totalPages}
                  onPageChange={(value) => {
                    setCatalogPage(value);
                    setProductId('');
                  }}
                  onLimitChange={(value) => {
                    setCatalogLimit(value);
                    setCatalogPage(1);
                    setProductId('');
                  }}
                  label="نتیجه"
                />
              </div>
              <label className="text-sm font-bold">
                تعداد موردنیاز <span className="text-rose-500">*</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="mt-1 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
                />
                <span className="mt-2 block text-xs font-normal text-slate-500">
                  تعداد باید عدد صحیح و حداقل ۱ باشد.
                </span>
              </label>
              <div className="flex flex-wrap items-end gap-3 lg:col-span-2">
                <button
                  type="submit"
                  disabled={saving || !productId || loadingCatalog}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  <FiPlus />
                  {saving ? 'در حال ثبت...' : 'ثبت درخواست نیاز'}
                </button>
                <span className="pb-1 text-xs text-slate-500">
                  پس از ثبت، درخواست در فهرست پایین نمایش داده می‌شود.
                </span>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
