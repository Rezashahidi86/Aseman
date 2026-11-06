export function DashboardWelcome({ isAdmin, branchName }) {
  return (
    <section className="dashboard-welcome-banner relative flex min-h-56 items-center justify-between overflow-hidden rounded-3xl px-6 py-8 text-white shadow-xl sm:px-10">
      <div className="absolute -bottom-28 right-1/4 h-60 w-60 rounded-full border border-white/15" />
      <div className="relative z-10 max-w-2xl md:max-w-[calc(100%-17rem)]">
        <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[10px]">{isAdmin ? 'نمای کلی مدیریتی' : 'فضای کاری شعبه'}</span>
        <h2 className="mt-4 text-2xl leading-relaxed font-extrabold sm:text-3xl">
          {isAdmin ? 'تصویر روشن‌تری از کسب‌وکارت داشته باش.' : 'امروز در ' + branchName + '، همه‌چیز مرتب پیش می‌رود.'}
        </h2>
        <p className="mt-2 max-w-xl text-xs leading-7 text-white/80 sm:text-sm">
          {isAdmin ? 'وضعیت فروش و عملکرد شعبه‌ها را از یک نقطه دنبال کن.' : 'وضعیت محصولات شعبه‌ات را در یک نگاه ببین.'}
        </p>
      </div>
      <div className="relative z-10 ml-4 hidden h-40 w-60 shrink-0 overflow-hidden rounded-2xl border border-amber-300/70 bg-[#05070d] shadow-2xl md:block lg:h-44 lg:w-64">
        <img
          src="/images/aseman-banner.webp"
          alt="لوگوی آسمان، فروشگاه شویندگی و مواد شوینده"
          className="h-full w-full object-contain"
          loading="eager"
          decoding="async"
        />
      </div>
    </section>
  );
}
