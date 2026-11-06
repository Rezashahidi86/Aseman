import { useState } from 'react';
import { FiLogOut, FiUser, FiCalendar, FiMenu } from 'react-icons/fi';
import { formatPersianDate } from '../../../shared/utils/date.js';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { ThemeToggle } from '../../../shared/components/ThemeToggle.jsx';
import { BranchSelector } from './BranchSelector.jsx';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="relative z-30 border-b px-4 py-3 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="flex w-full flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3"><button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border md:hidden" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }} type="button" onClick={() => window.dispatchEvent(new Event("ase-man-mobile-menu-open"))} aria-label="باز کردن منو"><FiMenu size={20} /></button><div className="min-w-0">
            <p className="mb-1 text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>
              سلام {user?.name || 'کاربر عزیز'}، خوش آمدی
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-lg font-extrabold tracking-tight sm:text-xl" style={{ color: 'var(--color-text)' }}>پنل مدیریت</h1>
              <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium" style={{ backgroundColor: 'var(--color-surface-muted)', color: 'var(--color-muted)' }}>
                <FiCalendar size={12} />
                {formatPersianDate(new Date())}
              </span>
            </div></div>
          </div>
          <div className="shrink-0 xl:hidden">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 sm:flex-none">
            <BranchSelector />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
            <div className="hidden xl:block">
              <ThemeToggle />
            </div>

            <button
              className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border px-2.5 py-1.5 text-right transition hover:-translate-y-px hover:shadow-sm sm:min-w-[160px] sm:flex-none sm:gap-3 sm:px-3"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              type="button"
              onClick={() => navigate('/profile')}
              aria-label="اطلاعات حساب کاربری"
              title="اطلاعات حساب کاربری"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-extrabold" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                {(user?.name || 'ک').slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-xs">{user?.name || 'کاربر'}</strong>
                <small className="mt-0.5 block text-[10px]" style={{ color: 'var(--color-muted)' }}>
                  {user?.role === 'ADMIN' ? 'مدیر سامانه' : 'فروشنده'}
                </small>
              </span>
              <FiUser className="hidden shrink-0 sm:block" size={15} style={{ color: 'var(--color-muted)' }} aria-hidden="true" />
            </button>

            <button
              className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <FiLogOut size={15} aria-hidden="true" />
              <span className="hidden sm:inline">{isLoggingOut ? 'در حال خروج...' : 'خروج'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
