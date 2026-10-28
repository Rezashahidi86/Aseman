import { Component } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { ProtectedRoute } from '../features/auth/ProtectedRoute.jsx';
import { LoginPage } from '../features/auth/pages/LoginPage.jsx';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage.jsx';
import { ProductsPage } from '../features/products/pages/ProductsPage.jsx';
import { SalesPage } from '../features/sales/pages/SalesPage.jsx';
import { ReportsPage } from '../features/reports/pages/ReportsPage.jsx';
import { UsersPage } from '../features/users/pages/UsersPage.jsx';
import { BranchesPage } from '../features/branches/pages/BranchesPage.jsx';
import { ReferenceCatalogPage } from '../features/reference-catalog/pages/ReferenceCatalogPage.jsx';
import { CustomersPage } from '../features/customers/pages/CustomersPage.jsx';
import { NeedsPage } from '../features/needs/pages/NeedsPage.jsx';
import { ManualDocumentsPage } from '../features/manual-documents/pages/ManualDocumentsPage.jsx';
import { SettingsPage } from '../features/settings/pages/SettingsPage.jsx';
import { ForbiddenPage } from '../features/errors/pages/ForbiddenPage.jsx';
import { NotFoundPage } from '../features/errors/pages/NotFoundPage.jsx';

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
        <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300">!</span>
            <h1 className="mt-4 text-lg font-extrabold">بارگذاری برنامه با مشکل مواجه شد</h1>
            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">لطفاً صفحه را دوباره بارگذاری کنید.</p>
            <button className="mt-5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700" onClick={() => window.location.reload()}>
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
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'branches', element: <BranchesPage /> },
      { path: 'reference-catalog', element: <ReferenceCatalogPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'needs', element: <NeedsPage /> },
      { path: 'manual-documents', element: <ManualDocumentsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'forbidden', element: <ForbiddenPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export function AppRouter() {
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  );
}
