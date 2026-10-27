import { Link, NavLink } from 'react-router';

const links = [{ to: '/', label: 'داشبورد', icon: '⌂', end: true }];
const upcoming = [
  { label: 'محصولات و موجودی', icon: '▦' },
  { label: 'فروش‌ها', icon: '↗' },
  { label: 'مشتریان', icon: '♙' },
  { label: 'گزارش‌ها', icon: '▥' },
];

export function DashboardSidebar() {
  return (
    <aside className="sticky top-0 flex h-auto flex-col border-b border-slate-200 bg-white/90 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 md:h-screen md:border-b-0 md:border-l md:p-5">
      <Link className="mb-4 flex items-center gap-3 px-1 pb-2 no-underline md:mb-8 md:pb-0" to="/" aria-label="آسمان، داشبورد">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-800 text-2xl font-extrabold text-white shadow-lg shadow-indigo-600/20">آ</span>
        <span><strong className="block text-base font-extrabold text-slate-900 dark:text-white">آسمان</strong><small className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">مدیریت فروشگاه</small></span>
      </Link>

      <div className="mb-2 hidden px-3 text-xs text-slate-500 md:block dark:text-slate-400">فضای کاری</div>
      <nav className="flex gap-1.5 overflow-x-auto md:grid md:overflow-visible" aria-label="ناوبری اصلی">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `flex min-h-10 min-w-max items-center gap-3 rounded-xl border px-3 text-xs transition md:min-h-12 ${isActive ? 'border-indigo-100 bg-indigo-50 font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300' : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}
          >
            <span className="grid w-6 place-items-center text-lg" aria-hidden="true">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
        {upcoming.map((item) => (
          <div className="flex min-h-10 min-w-max cursor-default items-center gap-3 rounded-xl px-3 text-xs text-slate-400 opacity-70 md:min-h-12" aria-disabled="true" key={item.label}>
            <span className="grid w-6 place-items-center text-lg" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            <span className="mr-auto rounded-md border border-slate-200 px-1.5 py-0.5 text-[9px] dark:border-slate-700">بعداً</span>
          </div>
        ))}
      </nav>

      <div className="mt-auto hidden items-center gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-500 md:flex dark:border-slate-800 dark:text-slate-400">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span>نشست کاربری فعال است</span>
      </div>
    </aside>
  );
}
