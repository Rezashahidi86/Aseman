import { StrictMode } from 'react';
import { Toaster } from 'sonner';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ActiveBranchProvider } from './branches/ActiveBranchContext.jsx';
import { ThemeProvider, useTheme } from './theme/ThemeContext.jsx';
import { AppRouter } from './app/router.jsx';
import { GlobalLoadingIndicator } from './shared/components/GlobalLoadingIndicator.jsx';
import './index.css';

function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-center"
      dir="rtl"
      theme={theme}
      richColors
      closeButton
      toastOptions={{ className: 'font-sans' }}
    />
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ActiveBranchProvider>
          <GlobalLoadingIndicator />
          <AppRouter />
          <AppToaster />
        </ActiveBranchProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
