export function DashboardWelcome({ isAdmin, branchName }) {
  return (
    <section className="welcome-panel">
      <div className="welcome-panel__content">
        <span className="welcome-panel__label">{isAdmin ? 'نمای کلی مدیریتی' : 'فضای کاری شعبه'}</span>
        <h2>
          {isAdmin ? 'تصویر روشن‌تری از کسب‌وکارت داشته باش.' : 'امروز در ' + branchName + '، همه‌چیز مرتب پیش می‌رود.'}
        </h2>
        <p>
          {isAdmin
            ? 'وضعیت فروش و عملکرد شعبه‌ها را از یک نقطه دنبال کن.'
            : 'وضعیت محصولات شعبه‌ات را در یک نگاه ببین.'}
        </p>
      </div>
      <div className="welcome-panel__illustration" aria-hidden="true">
        <span className="illustration-card illustration-card--one">فروش هوشمند</span>
        <span className="illustration-card illustration-card--two">مدیریت ساده</span>
        <span className="illustration-orbit">آ</span>
      </div>
    </section>
  );
}
