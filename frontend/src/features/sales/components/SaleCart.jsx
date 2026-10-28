import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const quantity = new Intl.NumberFormat('fa-IR');

function formatMoney(value) {
  return `${money.format(Number(value) || 0)} تومان`;
}

export function SaleCart({ items, onQuantityChange, onPriceChange, onRemove, onClear, onReview }) {
  const total = items.reduce((sum, item) => sum + item.quantity * item.finalSalePrice, 0);
  const profit = items.reduce((sum, item) => sum + item.quantity * (item.finalSalePrice - item.purchasePrice), 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <div><h2 className="text-sm font-extrabold">سبد فروش</h2><p className="mt-1 text-[10px] text-slate-500">{quantity.format(items.length)} قلم · {quantity.format(count)} عدد</p></div>
        <button className="text-[10px] font-bold text-rose-600 hover:underline disabled:opacity-40 dark:text-rose-400" type="button" onClick={onClear} disabled={!items.length}>خالی‌کردن سبد</button>
      </div>
      {!items.length ? <div className="grid min-h-40 place-items-center px-5 text-center text-xs text-slate-500">هنوز محصولی به سبد اضافه نشده است.</div> : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item) => (
            <div className="space-y-3 p-4" key={item._id}>
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-extrabold">{item.name}</p><p className="mt-1 text-[10px] text-slate-500">قیمت اصلی: {formatMoney(item.salePrice)}</p></div><button className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950" type="button" onClick={() => { if (window.confirm('آیا «' + item.name + '» از سبد فروش حذف شود؟')) onRemove(item._id); }} aria-label={`حذف ${item.name} از سبد`}><FiTrash2 size={15} /></button></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><label className="text-[10px] font-bold text-slate-500">تعداد</label><div className="mt-1 flex items-center gap-2"><button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-slate-700" type="button" onClick={() => onQuantityChange(item._id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="کاهش تعداد"><FiMinus size={13} /></button><span className="min-w-8 text-center text-xs font-extrabold">{quantity.format(item.quantity)}</span><button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-slate-700" type="button" onClick={() => onQuantityChange(item._id, item.quantity + 1)} disabled={item.quantity >= item.stockAtAdd} aria-label="افزایش تعداد"><FiPlus size={13} /></button><span className="text-[10px] text-slate-400">از {quantity.format(item.stockAtAdd)}</span></div></div>
                <label className="block text-[10px] font-bold text-slate-500">قیمت واحد این فروش (تومان)<input className="mt-1 min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" type="number" min={item.salePrice} step="any" value={item.finalSalePrice} onChange={(event) => onPriceChange(item._id, event.target.value)} aria-label={`قیمت ویژه ${item.name}`} /></label>
              </div>
              {item.finalSalePrice !== item.salePrice && <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-300">قیمت ویژه فقط برای این فروش اعمال می‌شود؛ قیمت اصلی محصول تغییر نمی‌کند.</p>}
              <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">جمع این قلم</span><strong>{formatMoney(item.quantity * item.finalSalePrice)}</strong></div>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3 border-t border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex items-center justify-between text-xs"><span className="text-slate-500">مبلغ کل</span><strong className="text-base">{formatMoney(total)}</strong></div>
        <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">سود تخمینی</span><span className={profit < 0 ? 'font-bold text-rose-600' : 'font-bold text-emerald-600'}>{formatMoney(profit)}</span></div>
        <button className="min-h-11 w-full rounded-xl bg-indigo-600 px-4 text-xs font-extrabold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={onReview} disabled={!items.length}>بررسی و تأیید فروش</button>
      </div>
    </section>
  );
}
