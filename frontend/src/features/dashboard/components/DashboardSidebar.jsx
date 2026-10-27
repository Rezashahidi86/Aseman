import { Link, NavLink } from 'react-router';

const links = [
  { to: '/', label: 'داشبورد', icon: '⌂', end: true },
];

const upcoming = [
  { label: 'محصولات و موجودی', icon: '▦' },
  { label: 'فروش‌ها', icon: '↗' },
  { label: 'مشتریان', icon: '♙' },
  { label: 'گزارش‌ها', icon: '▥' },
];

export function DashboardSidebar() {
  return (
    <aside className="sidebar">
      <Link className="brand" to="/" aria-label="آسمان، داشبورد">
        <span className="brand__mark">آ</span>
        <span><strong>آسمان</strong><small>مدیریت فروشگاه</small></span>
      </Link>

      <div className="sidebar__caption">فضای کاری</div>
      <nav className="navigation" aria-label="ناوبری اصلی">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => 'navigation__item' + (isActive ? ' navigation__item--active' : '')}
          >
            <span className="navigation__symbol" aria-hidden="true">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
        {upcoming.map((item) => (
          <div className="navigation__item navigation__item--disabled" aria-disabled="true" key={item.label}>
            <span className="navigation__symbol" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            <span className="nav-soon">بعداً</span>
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <span className="status-dot" />
        <span>نشست کاربری فعال است</span>
      </div>
    </aside>
  );
}
