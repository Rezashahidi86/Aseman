import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('fa-IR');

function formatMoney(value) {
  return `${money.format(Number(value) || 0)} تومان`;
}

function formatNumber(value) {
  return number.format(Number(value) || 0);
}

export function ProductTable({ products, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return <div className="grid min-h-48 place-items-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900" role="status">در حال دریافت محصولات...</div>;
  }

  if (!products.length) {
    return <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center dark:border-slate-700 dark:bg-slate-900"><div><p className="text-sm font-extrabold">محصولی پیدا نشد</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">عبارت جست‌وجو یا فیلترها را تغییر دهید.</p></div></div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-right text-xs">
          <thead className="bg-slate-50 text-[11px] text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
            <tr>
              <th className="px-4 py-4 font-bold">محصول</th>
              <th className="px-4 py-4 font-bold">بارکد</th>
              <th className="px-4 py-4 font-bold">قیمت خرید</th>
              <th className="px-4 py-4 font-bold">قیمت فروش</th>
              <th className="px-4 py-4 font-bold">موجودی</th>
              <th className="px-4 py-4 font-bold">حداقل موجودی</th>
              <th className="px-4 py-4 font-bold">وضعیت</th>
              <th className="px-4 py-4 font-bold">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((product) => {
              const isLow = Number(product.quantity) <= Number(product.minimumStock ?? 0);

              return (
                <tr className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40" key={product._id}>
                  <td className="max-w-52 px-4 py-4"><span className="block truncate font-extrabold text-slate-800 dark:text-slate-100">{product.name}</span></td>
                  <td className="px-4 py-4 font-mono text-slate-500" dir="ltr">{product.barcode || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-4">{formatMoney(product.purchasePrice)}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-bold">{formatMoney(product.salePrice)}</td>
                  <td className="px-4 py-4 font-bold">{formatNumber(product.quantity)}</td>
                  <td className="px-4 py-4">{formatNumber(product.minimumStock ?? 0)}</td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${isLow ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>{isLow ? 'موجودی کم' : 'موجود'}</span></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-1.5">
                    <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300" type="button" onClick={() => onEdit(product)} aria-label={`ویرایش ${product.name}`}><FiEdit2 size={15} /></button>
                    <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-rose-950 dark:hover:text-rose-300" type="button" onClick={() => onDelete(product)} aria-label={`حذف ${product.name}`}><FiTrash2 size={15} /></button>
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
