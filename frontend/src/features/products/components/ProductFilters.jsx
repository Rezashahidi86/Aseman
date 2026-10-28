import { FiSearch, FiX } from 'react-icons/fi';

const inputClass = 'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950';

export function ProductFilters({ filters, onChange, onApply, onReset }) {
  const update = (event) => onChange((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <form className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(160px,0.8fr)_180px_150px_auto] xl:items-end dark:border-slate-800 dark:bg-slate-900" onSubmit={(event) => { event.preventDefault(); onApply(); }}>
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">جست‌وجوی نام محصول
        <span className="relative mt-2 block"><FiSearch className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} /><input className={`${inputClass} pr-9`} name="name" value={filters.name} onChange={update} placeholder="نام محصول..." maxLength={100} /></span>
      </label>
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">بارکد
        <input className={inputClass + ' mt-2'} name="barcode" value={filters.barcode} onChange={update} placeholder="جست‌وجوی بارکد" maxLength={100} />
      </label>
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">وضعیت موجودی
        <select className={inputClass + ' mt-2'} name="stock" value={filters.stock} onChange={update}>
          <option value="all">همه محصولات</option>
          <option value="low">موجودی کم</option>
          <option value="available">موجودی کافی</option>
        </select>
      </label>
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">مرتب‌سازی
        <select className={inputClass + ' mt-2'} name="sort" value={filters.sort} onChange={update}>
          <option value="-createdAt">جدیدترین</option>
          <option value="name">نام محصول</option>
          <option value="-salePrice">گران‌ترین فروش</option>
          <option value="salePrice">ارزان‌ترین فروش</option>
          <option value="quantity">کمترین موجودی</option>
          <option value="-quantity">بیشترین موجودی</option>
        </select>
      </label>
      <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
        <button className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-700" type="submit"><FiSearch size={15} /> جست‌وجو</button>
        <button className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" type="button" onClick={onReset}><FiX size={15} /> پاک‌کردن</button>
      </div>
    </form>
  );
}
