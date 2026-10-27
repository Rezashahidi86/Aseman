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
    <header className="topbar">
      <div>
        <p className="topbar__eyebrow">سلام {user?.name || 'کاربر عزیز'}، خوش آمدی</p>
        <h1>داشبورد</h1>
      </div>
      <div className="topbar__actions">
        <ThemeToggle />
        <div className="topbar__profile">
          <span className="avatar">{(user?.name || 'ک').slice(0, 1)}</span>
          <span>
            <strong>{user?.name || 'کاربر'}</strong>
            <small>{user?.role === 'ADMIN' ? 'مدیر سامانه' : 'فروشنده'}</small>
          </span>
        </div>
        <button className="button button--secondary logout-button" type="button" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? 'در حال خروج...' : 'خروج'}
        </button>
      </div>
    </header>
  );
}
