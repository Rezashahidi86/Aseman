import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'aseman_theme';

export const themes = [
  { id: 'ocean-light', name: 'آبی اقیانوسی', mode: 'light', colors: ['#eff6ff', '#2563eb', '#1e40af'] },
  { id: 'violet-light', name: 'بنفش مدرن', mode: 'light', colors: ['#f5f3ff', '#7c3aed', '#5b21b6'] },
  { id: 'emerald-light', name: 'سبز زمردی', mode: 'light', colors: ['#ecfdf5', '#059669', '#047857'] },
  { id: 'teal-light', name: 'فیروزه‌ای', mode: 'light', colors: ['#f0fdfa', '#0d9488', '#0f766e'] },
  { id: 'sunset-light', name: 'غروب آفتاب', mode: 'light', colors: ['#fff7ed', '#ea580c', '#b91c1c'] },
  { id: 'navy-dark', name: 'سرمه‌ای', mode: 'dark', colors: ['#111827', '#60a5fa', '#1e3a8a'] },
  { id: 'violet-dark', name: 'بنفش عمیق', mode: 'dark', colors: ['#1e1b2e', '#a78bfa', '#6d28d9'] },
  { id: 'graphite-dark', name: 'گرافیتی', mode: 'dark', colors: ['#202124', '#a1a1aa', '#52525b'] },
  { id: 'forest-dark', name: 'جنگلی', mode: 'dark', colors: ['#10251f', '#34d399', '#047857'] },
  { id: 'sunset-dark', name: 'غروب آتشین', mode: 'dark', colors: ['#2a1717', '#fb923c', '#dc2626'] },
];

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (themes.some((item) => item.id === savedTheme)) return savedTheme;
  if (savedTheme === 'dark') return 'navy-dark';
  if (savedTheme === 'light') return 'ocean-light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'navy-dark' : 'ocean-light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const selectedTheme = themes.find((item) => item.id === theme) || themes[0];
  const mode = selectedTheme.mode;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.mode = mode;
    root.style.colorScheme = mode;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, mode]);

  const selectTheme = useCallback((nextTheme) => {
    if (themes.some((item) => item.id === nextTheme)) setTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const currentTheme = themes.find((item) => item.id === current) || themes[0];
      const nextMode = currentTheme.mode === 'dark' ? 'light' : 'dark';
      const matching = themes.find((item) => item.mode === nextMode);
      return matching.id;
    });
  }, []);

  const value = useMemo(() => ({ theme, mode, themes, selectTheme, toggleTheme }), [theme, mode, selectTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
