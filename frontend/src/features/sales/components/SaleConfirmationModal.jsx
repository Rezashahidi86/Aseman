import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';

const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const quantity = new Intl.NumberFormat('fa-IR');

function formatMoney(value) {
  return `${money.format(Number(value) || 0)} تومان`;
}

export function SaleConfirmationModal({ items, isSubmitting, error, onClose, onConfirm }) {
  const total = items.reduce((sum, item) => sum + item.quantity * item.finalSalePrice, 0);
  const profit = items.reduce((sum, item) => sum + item.quantity * (item.finalSalePrice - item.purchasePrice), 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) onClose(); }}>
      <section className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7 dark:border-slate-800 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="sale-confirmation-title" dir="rtl">
        <div className="flex items-start justify-between gap-3"><div><h2 id="sale-confirmation-title" className="text-lg font-extrabold">بررسی نهایی فروش</h2><p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">قبل از ثبت، اقلام، تعداد و قیمت نهایی را بررسی کنید.</p></div><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 dark:border-slate-700" type="button" onClick={onClose} disabled={isSubmitting} aria-label="بستن"><FiX size={17} /></button></div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800"><table className="w-full min-w-[470px] text-right text-xs"><thead className="bg-slate-50 text-slate-500 dark:bg-slate-800"><tr><th className="px-3 py-3">محصول</th><th className="px-3 py-3">تعداد</th><th className="px-3 py-3">قیمت واحد</th><th className="px-3 py-3">جمع</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{items.map((item) => <tr key={item._id}><td className="px-3 py-3 font-bold">{item.name}{item.finalSalePrice !== item.salePrice && <span className="mr-2 text-[9px] font-normal text-indigo-600 dark:text-indigo-300">قیمت ویژه</span>}</td><td className="px-3 py-3">{quantity.format(item.quantity)}</td><td className="whitespace-nowrap px-3 py-3">{formatMoney(item.finalSalePrice)}</td><td className="whitespace-nowrap px-3 py-3 font-bold">{formatMoney(item.quantity * item.finalSalePrice)}</td></tr>)}</tbody></table></div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-[10px] text-slate-500">تعداد کل</p><p className="mt-1 text-sm font-extrabold">{quantity.format(count)} عدد</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-[10px] text-slate-500">مبلغ قابل پرداخت</p><p className="mt-1 text-sm font-extrabold">{formatMoney(total)}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-[10px] text-slate-500">سود تخمینی</p><p className={`mt-1 text-sm font-extrabold ${profit < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatMoney(profit)}</p></div></div>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><FiAlertTriangle className="mt-1 shrink-0" size={15} /><p>با تأیید فروش، موجودی کالا در سرور کاهش می‌یابد و فروش ثبت می‌شود. این عملیات را فقط یک بار تأیید کنید.</p></div>
        {error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" role="alert">{error}</p>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-start"><button className="min-h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" type="button" onClick={onClose} disabled={isSubmitting}>بازگشت به سبد</button><button className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-50" type="button" onClick={onConfirm} disabled={isSubmitting}>{isSubmitting ? 'در حال ثبت فروش...' : <><FiCheck size={16} /> تأیید و ثبت فروش</>}</button></div>
      </section>
    </div>
  );
}
