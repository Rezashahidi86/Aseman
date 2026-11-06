export function DashboardWelcome({ isAdmin, branchName }) {
  return (
    <section className="dashboard-welcome-banner relative flex min-h-56 items-center justify-between overflow-hidden rounded-3xl px-6 py-8 text-white shadow-xl sm:px-10">
      <div className="absolute -bottom-28 right-1/4 h-60 w-60 rounded-full border border-white/15" />
      <div className="relative z-10 max-w-2xl">
        <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[10px]">{isAdmin ? 'نمای کلی مدیریتی' : 'فضای کاری شعبه'}</span>
        <h2 className="mt-4 text-2xl leading-relaxed font-extrabold sm:text-3xl">
          {isAdmin ? 'تصویر روشن‌تری از کسب‌وکارت داشته باش.' : 'امروز در ' + branchName + '، همه‌چیز مرتب پیش می‌رود.'}
        </h2>
        <p className="mt-2 max-w-xl text-xs leading-7 text-white/80 sm:text-sm">
          {isAdmin ? 'وضعیت فروش و عملکرد شعبه‌ها را از یک نقطه دنبال کن.' : 'وضعیت محصولات شعبه‌ات را در یک نگاه ببین.'}
        </p>
      </div>
      <div className="relative z-10 ml-4 hidden h-44 w-44 shrink-0 place-items-center md:grid">
        <span className="absolute left-0 top-2 rounded-xl border border-white/50 bg-white/95 px-3 py-2 text-[10px] font-extrabold text-slate-800 shadow-lg">فروش هوشمند</span>
        <span className="grid h-32 w-32 rotate-[-5deg] place-items-center rounded-3xl border-2 shadow-2xl" style={{ background: 'linear-gradient(145deg, #102d50, #071525)', borderColor: '#d6a84f' }}>
          <svg viewBox="0 0 64 64" className="h-28 w-28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="نشان فروشگاه محصولات شوینده آسمان" role="img">
            <path d="M8 27 31.5 8 56 27" stroke="#F5C66B" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 25v-5h7" stroke="#F5C66B" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M18 31h10l3 5v17H15V37l3-6Z" fill="#1688D4" stroke="#B9E8FF" strokeWidth="1.5"/>
            <path d="M20 31v-4h7v4M21 40h7" stroke="#D9F5FF" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M37 35h9l3 4v14H34V39l3-4Z" fill="#F4F7FC" stroke="#D6A84F" strokeWidth="1.5"/>
            <path d="M39 35v-4h6v4" stroke="#D6A84F" strokeWidth="1.7" strokeLinecap="round"/>
            <path d="M11 48h6m32 0h5" stroke="#F5C66B" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="49" cy="17" r="3" fill="#55C8F2"/><circle cx="55" cy="11" r="1.8" fill="#BDEEFF"/>
            <path d="m10 13 1.5 3.5L15 18l-3.5 1.5L10 23l-1.5-3.5L5 18l3.5-1.5L10 13Z" fill="#F5C66B"/>
          </svg>
        </span>
        <span className="absolute bottom-2 right-0 rounded-xl border border-white/50 bg-white/95 px-3 py-2 text-[10px] font-extrabold text-slate-800 shadow-lg">مدیریت ساده</span>
      </div>
    </section>
  );
}
