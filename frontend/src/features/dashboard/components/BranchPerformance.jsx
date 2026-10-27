const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('fa-IR');

export function BranchPerformance({ branches = [] }) {
  return (
    <section className="mt-5 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold">عملکرد شعبه‌ها</h2>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">خلاصه فروش ماه جاری هر شعبه</p>
        </div>
        <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[10px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">مدیریت</span>
      </div>
      {branches.length ? (
        <div className="grid gap-3">
          {branches.map((item) => (
            <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950" key={item.branch.id || item.branch._id}>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-300" aria-hidden="true">⌂</span>
                <div>
                  <span>{item.branch.name}</span>
                  <div className="mt-1 text-[10px] font-normal text-slate-500 dark:text-slate-400">{item.branch.code} · {item.branch.isActive ? 'فعال' : 'غیرفعال'}</div>
                </div>
              </div>
              <div className="text-left text-xs font-bold">
                {money.format(Number(item.totalSales) || 0)} تومان
                <small className="mt-1 block text-[10px] font-normal text-slate-500 dark:text-slate-400">{number.format(Number(item.salesCount) || 0)} فروش</small>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">هنوز آماری برای شعبه‌ها ثبت نشده است.</p>}
    </section>
  );
}
