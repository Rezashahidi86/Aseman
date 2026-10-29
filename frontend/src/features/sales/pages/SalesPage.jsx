import { useCallback, useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiSearch } from 'react-icons/fi';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';
import { getProducts } from '../../../api/services/productService.js';
import { registerSale } from '../../../api/services/salesService.js';
import { formatPersianDateTime } from '../../../shared/utils/date.js';
import { confirmWithToast, showError, showSuccess } from '../../../shared/utils/notifications.js';
import { BarcodeScannerInput } from '../components/BarcodeScannerInput.jsx';
import { ProductSearchResults } from '../components/ProductSearchResults.jsx';
import { ProductPagination } from '../../products/components/ProductPagination.jsx';
import { SaleCart } from '../components/SaleCart.jsx';
import { SaleConfirmationModal } from '../components/SaleConfirmationModal.jsx';

const newIdempotencyKey = () => globalThis.crypto?.randomUUID?.() || `sale-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

export function SalesPage() {
  const { user } = useAuth();
  const { activeBranch, activeBranchId, isLoadingBranches } = useActiveBranch();
  const [scannerValue, setScannerValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchedName, setSearchedName] = useState('');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cart, setCart] = useState([]);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);
  const idempotencyKeyRef = useRef('');

  useEffect(() => {
    showError(pageError);
  }, [pageError]);

  useEffect(() => {
    showSuccess(notice);
  }, [notice]);

  useEffect(() => {
    showError(submitError);
  }, [submitError]);

  const isAdmin = user?.role === 'ADMIN';
  const branchRequired = isAdmin && !activeBranchId;

  const searchProducts = useCallback(async ({ barcode, name, page: requestedPage = 1, limit: requestedLimit = limit }) => {
    if (branchRequired || isLoadingBranches) {
      setPageError('ابتدا منتظر بارگذاری یا انتخاب شعبه فعال بمانید.');
      return [];
    }

    setIsSearching(true);
    setPageError('');
    setNotice('');

    try {
      const params = { page: requestedPage, limit: requestedLimit, sort: 'name' };
      if (barcode) params.barcode = barcode;
      else if (name) params.name = name;
      if (isAdmin) params.branchId = activeBranchId;

      const response = await getProducts(params);
      const results = response?.data?.products || [];
      const resultPagination = response?.pagination || {};
      setProducts(results);
      setPagination({
        total: Number(resultPagination.total) || 0,
        totalPages: Number(resultPagination.totalPages) || 0,
      });
      setPage(Number(resultPagination.page) || requestedPage);
      setHasSearched(true);

      if (barcode && results.length === 1) {
        addProductToCart(results[0]);
        setScannerValue('');
        setSearchValue('');
      } else if (barcode && results.length === 0) {
        setPageError('محصولی با این بارکد در شعبه فعال پیدا نشد.');
      }

      return results;
    } catch (error) {
      setPageError(error.message || 'جست‌وجوی محصول ناموفق بود.');
      setProducts([]);
      setPagination({ total: 0, totalPages: 0 });
      setHasSearched(true);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [activeBranchId, branchRequired, isAdmin, isLoadingBranches, limit]);

  const addProductToCart = (product) => {
    setPageError('');
    setNotice('');

    if (Number(product.quantity) <= 0) {
      setPageError('این محصول موجودی ندارد.');
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= Number(product.quantity)) {
          setPageError('تعداد درخواستی از موجودی بیشتر است.');
          return current;
        }

        return current.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1, stockAtAdd: Number(product.quantity) } : item);
      }

      return [...current, {
        _id: product._id,
        name: product.name,
        barcode: product.barcode,
        purchasePrice: Number(product.purchasePrice),
        salePrice: Number(product.salePrice),
        finalSalePrice: Number(product.salePrice),
        quantity: 1,
        stockAtAdd: Number(product.quantity),
      }];
    });
  };

  const handleBarcodeScan = (barcode) => {
    if (!barcode) return;
    setScannerValue(barcode);
    setSearchValue('');
    setSearchedName('');
    searchProducts({ barcode });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const value = searchValue.trim();
    if (!value) return;
    setPage(1);
    setSearchedName(value);
    searchProducts({ name: value, page: 1, limit });
  };

  const updateQuantity = (productId, nextQuantity) => {
    setCart((current) => current.map((item) => item._id === productId
      ? { ...item, quantity: Math.max(1, Math.min(Number(nextQuantity) || 1, item.stockAtAdd)) }
      : item));
  };

  const updatePrice = (productId, value) => {
    if (value === '') {
      setCart((current) => current.map((item) => item._id === productId ? { ...item, finalSalePrice: '' } : item));
      return;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    setCart((current) => current.map((item) => item._id === productId
      ? { ...item, finalSalePrice: Math.max(item.salePrice, parsed) }
      : item));
  };

  const removeItem = (productId) => setCart((current) => current.filter((item) => item._id !== productId));

  const clearCart = () => {
    if (!cart.length) return;

    confirmWithToast({
      message: 'تمام اقلام سبد فروش حذف شوند؟',
      confirmLabel: 'خالی‌کردن سبد',
      type: 'error',
      onConfirm: () => {
        setCart([]);
        idempotencyKeyRef.current = '';
        setSubmitError('');
      },
    });
  };

  const openReview = () => {
    const invalidItem = cart.find((item) => !Number.isFinite(Number(item.finalSalePrice)) || Number(item.finalSalePrice) < item.salePrice || !Number.isInteger(item.quantity) || item.quantity < 1);
    if (invalidItem) {
      setPageError(`قیمت یا تعداد «${invalidItem.name}» معتبر نیست.`);
      return;
    }

    if (!idempotencyKeyRef.current) idempotencyKeyRef.current = newIdempotencyKey();
    setSubmitError('');
    setIsReviewOpen(true);
  };

  const confirmSale = async () => {
    if (isSubmitting || !cart.length) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          finalSalePrice: Number(item.finalSalePrice),
        })),
      };

      if (isAdmin) payload.branchId = activeBranchId;

      const response = await registerSale(payload, idempotencyKeyRef.current);
      const receipt = response?.data?.receipt;
      setLastReceipt(receipt || { receiptNumber: '—', createdAt: new Date().toISOString(), totalSales: cart.reduce((sum, item) => sum + item.quantity * Number(item.finalSalePrice), 0), totalItemsSold: cart.reduce((sum, item) => sum + item.quantity, 0) });
      setCart([]);
      setIsReviewOpen(false);
      setProducts([]);
      setPagination({ total: 0, totalPages: 0 });
      setPage(1);
      setHasSearched(false);
      setScannerValue('');
      setSearchValue('');
      setSearchedName('');
      idempotencyKeyRef.current = '';
      setNotice(response?.isDuplicate ? 'این فروش قبلاً ثبت شده بود؛ رسید موجود بازیابی شد.' : 'فروش با موفقیت ثبت شد.');
    } catch (error) {
      const message = /stock|inventory|insufficient|quantity|موجودی/i.test(error.message || '') || error.status === 409
        ? 'موجودی این کالا تغییر کرده یا برای تعداد درخواستی کافی نیست. سبد را بررسی کنید و دوباره تلاش کنید.'
        : error.code === 'ECONNABORTED' || /ارتباط با سرور|network|fetch|زمان انتظار/i.test(error.message || '')
          ? 'ارتباط با سرور برقرار نشد یا پاسخ دیر رسید. فروش را دوباره بررسی و سپس تلاش کنید؛ درخواست با همان شناسه پیگیری می‌شود.'
          : error.message || 'ثبت فروش ناموفق بود. اطلاعات سبد را بررسی کنید.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
            <div className="mb-6"><p className="mb-2 text-xs text-slate-500 dark:text-slate-400">ثبت خرید مشتری</p><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">فروش جدید</h1><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{activeBranch?.name ? `شعبه فعال: ${activeBranch.name}` : isAdmin ? 'برای شروع، شعبه فعال را انتخاب کنید.' : 'بارکد کالا را اسکن یا نام محصول را جست‌وجو کنید.'}</p></div>
            {(pageError || submitError) && <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200" role="alert"><FiAlertCircle className="mt-0.5 shrink-0" size={18} /><div className="min-w-0"><p className="text-xs font-extrabold">{/موجودی|stock|inventory|quantity/i.test(pageError + ' ' + submitError) ? 'خطای موجودی کالا' : /ارتباط با سرور|network|fetch|زمان انتظار/i.test(pageError + ' ' + submitError) ? 'خطای ارتباط با سرور' : 'انجام عملیات ناموفق بود'}</p><p className="mt-1 text-xs leading-6">{pageError || submitError}</p>{submitError && <button className="mt-2 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-bold dark:border-rose-800" type="button" onClick={confirmSale} disabled={isSubmitting}>تلاش دوباره برای ثبت فروش</button>}</div><button className="mr-auto rounded-md px-2 py-1 text-xs" type="button" onClick={() => { setPageError(''); setSubmitError(''); }} aria-label="بستن پیام خطا">×</button></div>}
            {lastReceipt && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30"><div><p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">رسید آخرین فروش: {lastReceipt.receiptNumber}</p><p className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400">{formatPersianDateTime(lastReceipt.createdAt)} · {new Intl.NumberFormat('fa-IR').format(lastReceipt.totalItemsSold || 0)} عدد</p></div><strong className="text-sm text-emerald-800 dark:text-emerald-300">{new Intl.NumberFormat('fa-IR').format(lastReceipt.totalSales || 0)} تومان</strong></div>}
            {branchRequired ? <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-bold dark:border-slate-700 dark:bg-slate-900">برای ثبت فروش، ابتدا شعبه فعال را انتخاب کنید.</div> : (
              <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
                <section className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3"><h2 className="text-sm font-extrabold">اسکن بارکد</h2><p className="mt-1 text-[10px] leading-5 text-slate-500 dark:text-slate-400">بارکدخوان مانند صفحه‌کلید عمل می‌کند؛ پس از اسکن معمولاً Enter را ارسال می‌کند.</p></div><BarcodeScannerInput value={scannerValue} onChange={setScannerValue} onScan={handleBarcodeScan} disabled={isSearching || isLoadingBranches} /></div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="mb-3 text-sm font-extrabold">جست‌وجوی نام محصول</h2><form className="mb-3 flex gap-2" onSubmit={handleSearch}><label className="relative min-w-0 flex-1"><FiSearch className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} /><input className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="نام محصول..." maxLength={100} /></label><button className="min-h-11 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-50 dark:bg-indigo-600" type="submit" disabled={isSearching || !searchValue.trim()}>جست‌وجو</button></form><ProductSearchResults products={products} isLoading={isSearching} hasSearched={hasSearched} onAdd={addProductToCart} />
                    {hasSearched && searchedName && pagination.total > 0 && <div className="mt-3"><ProductPagination page={page} limit={limit} total={pagination.total} totalPages={pagination.totalPages} onPageChange={(nextPage) => { setPage(nextPage); searchProducts({ name: searchedName, page: nextPage, limit }); }} onLimitChange={(nextLimit) => { setLimit(nextLimit); setPage(1); searchProducts({ name: searchedName, page: 1, limit: nextLimit }); }} /></div>}</div>
                </section>
                <SaleCart items={cart} onQuantityChange={updateQuantity} onPriceChange={updatePrice} onRemove={removeItem} onClear={clearCart} onReview={openReview} />
              </div>
            )}
          </main>
        </div>
      </div>
      {isReviewOpen && <SaleConfirmationModal items={cart} isSubmitting={isSubmitting} error={submitError} onClose={() => { if (!isSubmitting) setIsReviewOpen(false); }} onConfirm={confirmSale} />}
    </div>
  );
}
