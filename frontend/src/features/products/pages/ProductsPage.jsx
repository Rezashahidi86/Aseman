import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiBox, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../../api/services/productService.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';
import { ProductFilters } from '../components/ProductFilters.jsx';
import { ProductFormModal } from '../components/ProductFormModal.jsx';
import { ProductPagination } from '../components/ProductPagination.jsx';
import { ProductTable } from '../components/ProductTable.jsx';

const DEFAULT_FILTERS = { name: '', barcode: '', stock: 'all', sort: '-createdAt' };
const number = new Intl.NumberFormat('fa-IR');

export function ProductsPage() {
  const { user } = useAuth();
  const { activeBranch, activeBranchId, isLoadingBranches, branchError } = useActiveBranch();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadProducts = useCallback(async () => {
    if (isAdmin && !activeBranchId) {
      setProducts([]);
      setPagination({ total: 0, totalPages: 0 });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const params = {
        page,
        limit,
        sort: appliedFilters.sort,
      };

      if (appliedFilters.name.trim()) params.name = appliedFilters.name.trim();
      if (appliedFilters.barcode.trim()) params.barcode = appliedFilters.barcode.trim();
      if (appliedFilters.stock !== 'all') params.stock = appliedFilters.stock;
      if (isAdmin) params.branchId = activeBranchId;

      const response = await getProducts(params);
      const resultProducts = response?.data?.products || [];
      const resultPagination = response?.pagination || {};

      setProducts(resultProducts);
      setPagination({
        total: Number(resultPagination.total) || 0,
        totalPages: Number(resultPagination.totalPages) || 0,
      });
    } catch (loadError) {
      setError(loadError.message || 'دریافت محصولات ناموفق بود.');
      setProducts([]);
      setPagination({ total: 0, totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [activeBranchId, appliedFilters, isAdmin, limit, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

    const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleSaveProduct = async (payload) => {
    if (isAdmin && !activeBranchId) {
      setError('ابتدا شعبه فعال را انتخاب کنید.');
      return;
    }

    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload, isAdmin ? activeBranchId : undefined);
        setNotice('تغییرات محصول با موفقیت ذخیره شد.');
      } else {
        await createProduct(isAdmin ? { ...payload, branchId: activeBranchId } : payload);
        setNotice('محصول جدید با موفقیت ثبت شد.');
      }

      setEditingProduct(null);
      setIsCreating(false);
      if (!editingProduct) setPage(1);
      await loadProducts();
    } catch (saveError) {
      setError(saveError.message || 'ذخیره محصول انجام نشد.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`آیا از حذف محصول «${product.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`);
    if (!confirmed) return;

    setError('');
    setNotice('');

    try {
      await deleteProduct(product._id, isAdmin ? activeBranchId : undefined);
      setNotice('محصول با موفقیت حذف شد.');
      if (products.length === 1 && page > 1) setPage((current) => current - 1);
      else await loadProducts();
    } catch (deleteError) {
      setError(deleteError.message || 'حذف محصول انجام نشد.');
    }
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsCreating(false);
    setEditingProduct(null);
  };

  const branchRequired = isAdmin && !activeBranchId;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><FiBox size={16} /> مدیریت انبار</div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">محصولات و موجودی</h1>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{activeBranch?.name ? `شعبه فعال: ${activeBranch.name}` : isAdmin ? 'برای مشاهده و مدیریت محصولات، شعبه فعال را انتخاب کنید.' : 'فهرست محصولات شعبه شما'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" type="button" onClick={loadProducts} disabled={isLoading || branchRequired}><FiRefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> تازه‌سازی</button>
                <button className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={() => { setEditingProduct(null); setIsCreating(true); }} disabled={branchRequired || isLoadingBranches}><FiPlus size={16} /> افزودن محصول</button>
              </div>
            </div>

            {(error || branchError) && <section className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert"><FiAlertCircle className="mt-0.5 shrink-0" size={17} /><div className="text-xs leading-6">{error || branchError}</div></section>}
            {notice && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">{notice}</div>}

            {branchRequired ? (
              <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
                <div><p className="text-sm font-extrabold">شعبه‌ای انتخاب نشده است</p><p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">از انتخاب‌گر «شعبه فعال» در سربرگ، یک شعبه انتخاب کنید.</p></div>
              </div>
            ) : (
              <>
                <ProductFilters filters={filters} onChange={setFilters} onApply={handleApplyFilters} onReset={handleResetFilters} />
                <div className="mb-3 mt-5 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{number.format(pagination.total)} محصول در نتیجه جست‌وجو</p>
                  <span className="rounded-lg bg-slate-100 px-3 py-2 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{activeBranch?.name || 'شعبه من'}</span>
                </div>
                <ProductTable products={products} isLoading={isLoading || isLoadingBranches} onEdit={(product) => { setEditingProduct(product); setIsCreating(false); }} onDelete={handleDeleteProduct} />
                <div className="mt-4">
                  <ProductPagination page={page} limit={limit} total={pagination.total} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
      {(isCreating || editingProduct) && <ProductFormModal product={editingProduct} isSaving={isSaving} onClose={closeForm} onSubmit={handleSaveProduct} />}
    </div>
  );
}
