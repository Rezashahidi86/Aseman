const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('fa-IR');

export function BranchPerformance({ branches = [] }) {
  return (
    <section className="panel branch-panel">
      <div className="panel__heading">
        <div><h2>عملکرد شعبه‌ها</h2><p>خلاصه فروش ماه جاری هر شعبه</p></div>
        <span className="panel__badge">مدیریت</span>
      </div>
      {branches.length ? (
        <div className="branch-list">
          {branches.map((item) => (
            <article className="branch-row" key={item.branch.id || item.branch._id}>
              <div className="branch-row__name">
                <span className="branch-row__icon" aria-hidden="true">⌂</span>
                <div>
                  <span>{item.branch.name}</span>
                  <div className="branch-row__meta">{item.branch.code} · {item.branch.isActive ? 'فعال' : 'غیرفعال'}</div>
                </div>
              </div>
              <div className="branch-row__value">
                {money.format(Number(item.totalSales) || 0)} تومان
                <small>{number.format(Number(item.salesCount) || 0)} فروش</small>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="empty-state">هنوز آماری برای شعبه‌ها ثبت نشده است.</p>}
    </section>
  );
}
