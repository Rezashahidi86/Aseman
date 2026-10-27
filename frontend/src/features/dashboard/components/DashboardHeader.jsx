import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { ThemeToggle } from '../../../shared/components/ThemeToggle.jsx';

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
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur-lg sm:px-8 dark:border-slate-800 dark:bg-slate-900/80">
      <div>
        <p className="mb-1.5 text-[11px] text-slate-500 dark:text-slate-400">سلام {user?.name || 'کاربر عزیز'}، خوش آمدی</p>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">داشبورد</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2 sm:pl-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-indigo-100 bg-indigo-50 font-extrabold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">{(user?.name || 'ک').slice(0, 1)}</span>
          <span className="hidden sm:block"><strong className="block text-xs">{user?.name || 'کاربر'}</strong><small className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">{user?.role === 'ADMIN' ? 'مدیر سامانه' : 'فروشنده'}</small></span>
        </div>
        <button className="min-h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-rose-400" type="button" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? 'در حال خروج...' : 'خروج'}
        </button>
      </div>
    </header>
  );
}
