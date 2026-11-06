import { useEffect, useState } from 'react';
import { FiX, FiBarChart2, FiBookOpen, FiBox, FiHome, FiMapPin, FiTrendingUp, FiUsers, FiUser, FiClipboard, FiFileText } from 'react-icons/fi';
import { Link, NavLink } from 'react-router';
import { useAuth } from '../../../auth/AuthContext.jsx';

const links = [
  { to: '/', label: 'داشبورد', icon: FiHome, end: true },
  { to: '/products', label: 'محصولات و موجودی', icon: FiBox },
  { to: '/sales', label: 'ثبت فروش', icon: FiTrendingUp },
  { to: '/reports', label: 'گزارش‌ها', icon: FiBarChart2 },
  { to: '/branches', label: 'شعبه‌ها', icon: FiMapPin },
  { to: '/reference-catalog', label: 'کاتالوگ مرجع', icon: FiBookOpen },
  { to: '/customers', label: 'مشتریان', icon: FiUser },
  { to: '/needs', label: 'فهرست نیازها', icon: FiClipboard },
  { to: '/manual-documents', label: 'فاکتور دستی', icon: FiFileText },
];

export function DashboardSidebar() {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const openMenu = () => setIsMobileOpen(true);
    window.addEventListener('ase-man-mobile-menu-open', openMenu);
    return () => window.removeEventListener('ase-man-mobile-menu-open', openMenu);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);
  const visibleLinks = user?.role === 'ADMIN'
    ? [...links, { to: '/users', label: 'مدیریت کاربران', icon: FiUsers }]
    : links;

  return (
    <aside className="sticky top-0 z-20 flex h-auto min-w-0 flex-col border-b p-4 backdrop-blur-xl md:h-screen md:min-h-0 md:overflow-hidden md:border-b-0 md:border-l md:p-5" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 92%, transparent)', borderColor: 'var(--color-border)' }}>
      <div className="mb-4 flex items-center justify-between gap-2 md:mb-8">
      <Link className="flex min-w-0 items-center gap-3 px-1 pb-2 no-underline md:pb-0" to="/" aria-label="آسمان، داشبورد">
        <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border shadow-lg" style={{ background: 'linear-gradient(145deg, #102d50, #071525)', borderColor: '#d6a84f' }} aria-hidden="true">
          <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <span><strong className="block text-base font-extrabold text-slate-900 dark:text-white">آسمان</strong><small className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">مدیریت فروشگاه</small></span>
      </Link>
      <div className="mb-2 hidden px-3 text-xs text-slate-500 md:block dark:text-slate-400">فضای کاری</div>
      <nav className="flex min-w-0 gap-1.5 overflow-x-auto pb-1 md:min-h-0 md:flex-1 md:grid md:content-start md:overflow-x-hidden md:overflow-y-auto md:overscroll-contain md:pb-1 md:pl-1 md:pr-1" aria-label="ناوبری اصلی">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          return <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setIsMobileOpen(false)} className={({ isActive }) => `flex min-h-10 min-w-max items-center gap-3 rounded-xl border px-3 text-xs transition md:min-h-12 ${isActive ? 'border-indigo-100 bg-indigo-50 font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300' : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}><span className="grid w-6 place-items-center" aria-hidden="true"><Icon size={18} /></span><span>{link.label}</span></NavLink>;
        })}
      </nav>
      <div className="mt-auto hidden items-center gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-500 md:flex dark:border-slate-800 dark:text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span>نشست کاربری فعال است</span></div>
    </aside>
  );
}
