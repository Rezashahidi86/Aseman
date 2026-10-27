import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../auth/AuthContext.jsx';

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <main className="grid min-h-screen place-content-center justify-items-center gap-4 bg-slate-50 p-6 text-xs text-slate-500 dark:bg-slate-950 dark:text-slate-400" dir="rtl">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-800 text-2xl font-extrabold text-white shadow-lg shadow-indigo-600/20">آ</span>
        <span>در حال بررسی نشست کاربری...</span>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
