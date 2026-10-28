import { FiPlus, FiPackage } from 'react-icons/fi';

const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const quantity = new Intl.NumberFormat('fa-IR');

export function ProductSearchResults({ products, isLoading, hasSearched, onAdd }) {
  if (isLoading) return <div className="grid min-h-28 place-items-center rounded-xl border border-slate-200 bg-white text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">در حال جست‌وجوی محصولات...</div>;
  if (!hasSearched) return <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-slate-300 px-4 text-center text-xs text-slate-500 dark:border-slate-700">برای یافتن کالا، نام یا بارکد را جست‌وجو کنید.</div>;
  if (!products.length) return <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-slate-300 px-4 text-center text-xs text-slate-500 dark:border-slate-700">محصولی مطابق جست‌وجو پیدا نشد.</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {products.map((product) => {
          const outOfStock = Number(product.quantity) <= 0;
          return (
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between" key={product._id}>
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800"><FiPackage size={18} /></span>
                <div className="min-w-0"><p className="truncate text-xs font-extrabold">{product.name}</p><p className="mt-1 font-mono text-[10px] text-slate-500" dir="ltr">{product.barcode}</p><p className="mt-1 text-[10px] text-slate-500">موجودی: {quantity.format(product.quantity)} · قیمت: {money.format(product.salePrice)} تومان</p></div>
              </div>
              <button className="flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950" type="button" onClick={() => onAdd(product)} disabled={outOfStock}><FiPlus size={15} /> افزودن به سبد</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
