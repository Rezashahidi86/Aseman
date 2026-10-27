import { Component } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { ProtectedRoute } from '../features/auth/ProtectedRoute.jsx';
import { LoginPage } from '../features/auth/pages/LoginPage.jsx';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage.jsx';

class AppErrorBoundary extends Component {
  state = { hasError: false };

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

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [{ index: true, element: <DashboardPage /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  );
}
