import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const number = new Intl.NumberFormat('fa-IR');

export function ProductPagination({ page, limit, total, totalPages, onPageChange, onLimitChange }) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <p>نمایش {number.format((page - 1) * limit + 1)} تا {number.format(Math.min(page * limit, total))} از {number.format(total)} محصول</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">تعداد در صفحه
          <select className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-950" value={limit} onChange={(event) => onLimitChange(Number(event.target.value))}>
            {[10, 20, 50].map((value) => <option key={value} value={value}>{number.format(value)}</option>)}
          </select>
        </label>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800" type="button" aria-label="صفحه قبلی" onClick={() => onPageChange(page - 1)} disabled={page <= 1}><FiChevronRight size={17} /></button>
        <span className="min-w-20 text-center font-bold text-slate-700 dark:text-slate-200">صفحه {number.format(page)} از {number.format(Math.max(totalPages, 1))}</span>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800" type="button" aria-label="صفحه بعدی" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}><FiChevronLeft size={17} /></button>
      </div>
    </div>
  );
}
