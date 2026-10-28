import { StrictMode } from 'react';
import { Toaster } from 'sonner';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ActiveBranchProvider } from './branches/ActiveBranchContext.jsx';
import { ThemeProvider } from './theme/ThemeContext.jsx';
import { AppRouter } from './app/router.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ActiveBranchProvider>
          <AppRouter />
          <Toaster position="top-center" dir="rtl" richColors closeButton toastOptions={{ className: 'font-sans' }} />
        </ActiveBranchProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
