import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginRequest, logoutRequest } from '../api/services/authService.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'aseman_access_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (activeToken = token) => {
    if (!activeToken) {
      setUser(null);
      return null;
    }

    const response = await getCurrentUser(activeToken);
    const currentUser = response?.data?.user;

    if (!currentUser) {
      throw new Error('اطلاعات کاربر از سرور دریافت نشد.');
    }

    setUser(currentUser);
    return currentUser;
  }, [token]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const savedToken = sessionStorage.getItem(TOKEN_KEY);

      if (!savedToken) {
        if (active) setIsInitializing(false);
        return;
      }

      try {
        const response = await getCurrentUser(savedToken);

        if (!response?.data?.user) {
          throw new Error('اطلاعات کاربر دریافت نشد.');
        }

        if (active) {
          setToken(savedToken);
          setUser(response.data.user);
        }
      } catch {
        sessionStorage.removeItem(TOKEN_KEY);

        if (active) {
          setToken(null);
          setUser(null);
        }
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
    const response = await loginRequest({ email, password });

    if (!response?.token) {
      throw new Error('توکن ورود از سرور دریافت نشد.');
    }

    sessionStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);

    try {
      return await refreshUser(response.token);
    } catch (error) {
      sessionStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      throw error;
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    const activeToken = token;

    try {
      if (activeToken) await logoutRequest(activeToken);
    } finally {
      clearSession();
    }
  }, [clearSession, token]);

  const value = useMemo(() => ({
    token,
    user,
    isInitializing,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    refreshUser,
  }), [token, user, isInitializing, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
