import { useState } from 'react';
import { FiLogOut } from 'react-icons/fi';
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
    <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur-lg sm:px-8 dark:border-slate-800 dark:bg-slate-900/80">
      <div>
        <p className="mb-1.5 text-[11px] text-slate-500 dark:text-slate-400">سلام {user?.name || 'کاربر عزیز'}، خوش آمدی</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">پنل مدیریت</h1><span className="text-[10px] text-slate-500 dark:text-slate-400">{formatPersianDate(new Date())}</span></div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <BranchSelector />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-2 sm:pl-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-indigo-100 bg-indigo-50 font-extrabold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">{(user?.name || 'ک').slice(0, 1)}</span>
            <span className="hidden sm:block"><strong className="block text-xs">{user?.name || 'کاربر'}</strong><small className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">{user?.role === 'ADMIN' ? 'مدیر سامانه' : 'فروشنده'}</small></span>
          </div>
          <button className="flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-rose-400" type="button" onClick={handleLogout} disabled={isLoggingOut}>
            <FiLogOut size={15} aria-hidden="true" />
            {isLoggingOut ? 'در حال خروج...' : 'خروج'}
          </button>
        </div>
      </div>
    </header>
  );
}
