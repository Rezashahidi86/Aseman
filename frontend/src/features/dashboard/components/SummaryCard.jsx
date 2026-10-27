export function SummaryCard({ icon, label, value, hint }) {
  return (
    <article className="grid min-h-36 gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-lg text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300" aria-hidden="true">{icon}</span>
      </div>
      <strong className="break-words text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">{value}</strong>
      <span className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>
    </article>
  );
}
