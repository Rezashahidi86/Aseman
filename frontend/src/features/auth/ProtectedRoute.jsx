import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../auth/AuthContext.jsx';

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <main className="loading-screen" dir="rtl">
        <span className="loading-mark">آ</span>
        <span>در حال بررسی نشست کاربری...</span>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
