import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginRequest, logoutRequest } from '../api/services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await getCurrentUser();
    const currentUser = response?.data?.user;

    if (!currentUser) {
      throw new Error('اطلاعات کاربر از سرور دریافت نشد.');
    }

    setUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        window.sessionStorage.removeItem('aseman_access_token');
      } catch {
      }

      try {
        const response = await getCurrentUser();

        if (!response?.data?.user) {
          throw new Error('اطلاعات کاربر دریافت نشد.');
        }

        if (active) setUser(response.data.user);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsInitializing(false);
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    await loginRequest({ email, password });

    try {
      return await refreshUser();
    } catch (error) {
      try {
        await logoutRequest();
      } catch {
        clearSession();
      }
      clearSession();
      throw error;
    }
  }, [clearSession, refreshUser]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(() => ({
    user,
    isInitializing,
    isAuthenticated: Boolean(user),
    login,
    logout,
    refreshUser,
  }), [user, isInitializing, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
