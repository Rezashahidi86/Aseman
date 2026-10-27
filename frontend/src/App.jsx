import { Component } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';

function LoadingScreen() {
  return (
    <main className="loading-screen" dir="rtl">
      <span className="loading-mark">آ</span>
      <span>در حال آماده‌سازی آسمان...</span>
    </main>
  );
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Application rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error" dir="rtl">
          <div className="error-card">
            <span className="error-symbol">!</span>
            <h1>بارگذاری برنامه با مشکل مواجه شد</h1>
            <p>لطفاً صفحه را دوباره بارگذاری کنید.</p>
            <button className="button button--primary" onClick={() => window.location.reload()}>
              بارگذاری دوباره
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

function AppRoutes() {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppRoutes />
    </AppErrorBoundary>
  );
}
