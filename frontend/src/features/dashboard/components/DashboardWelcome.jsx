import { FiActivity } from 'react-icons/fi';

export function DashboardWelcome({ isAdmin, branchName }) {
  return (
    <section className="relative flex min-h-56 items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-600 via-indigo-700 to-indigo-950 px-6 py-8 text-white shadow-xl shadow-indigo-950/10 sm:px-10">
      <div className="absolute -bottom-28 right-1/4 h-60 w-60 rounded-full border border-white/15" />
      <div className="relative z-10 max-w-2xl">
        <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[10px]">{isAdmin ? 'نمای کلی مدیریتی' : 'فضای کاری شعبه'}</span>
        <h2 className="mt-4 text-2xl leading-relaxed font-extrabold sm:text-3xl">
          {isAdmin ? 'تصویر روشن‌تری از کسب‌وکارت داشته باش.' : 'امروز در ' + branchName + '، همه‌چیز مرتب پیش می‌رود.'}
        </h2>
        <p className="mt-2 max-w-xl text-xs leading-7 text-indigo-100 sm:text-sm">
          {isAdmin ? 'وضعیت فروش و عملکرد شعبه‌ها را از یک نقطه دنبال کن.' : 'وضعیت محصولات شعبه‌ات را در یک نگاه ببین.'}
        </p>
      </div>
      <div className="relative z-10 ml-4 hidden h-44 w-44 shrink-0 place-items-center md:grid">
        <span className="absolute left-0 top-2 rounded-xl border border-white/50 bg-white/95 px-3 py-2 text-[10px] font-extrabold text-indigo-800 shadow-lg">فروش هوشمند</span>
        <span className="grid h-28 w-28 rotate-[-8deg] place-items-center rounded-3xl border border-white/40 bg-white/15 shadow-xl"><FiActivity size={54} aria-hidden="true" /></span>
        <span className="absolute bottom-2 right-0 rounded-xl border border-white/50 bg-white/95 px-3 py-2 text-[10px] font-extrabold text-indigo-800 shadow-lg">مدیریت ساده</span>
      </div>
    </section>
  );
}
