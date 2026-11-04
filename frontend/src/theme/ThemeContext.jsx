import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'aseman_theme';

export const THEME_OPTIONS = [
  { id: 'light-ocean', name: 'اقیانوسی', mode: 'light', color: '#0f766e' },
  { id: 'light-violet', name: 'بنفش مدرن', mode: 'light', color: '#7c3aed' },
  { id: 'light-emerald', name: 'زمردی', mode: 'light', color: '#047857' },
  { id: 'light-amber', name: 'کهربایی', mode: 'light', color: '#b45309' },
  { id: 'dark-midnight', name: 'نیمه‌شب', mode: 'dark', color: '#60a5fa' },
  { id: 'dark-amethyst', name: 'آمتیست', mode: 'dark', color: '#a78bfa' },
  { id: 'dark-forest', name: 'جنگلی', mode: 'dark', color: '#34d399' },
  { id: 'dark-graphite', name: 'گرافیتی', mode: 'dark', color: '#22d3ee' },
];

function getInitialPalette() {
  const savedPalette = localStorage.getItem(THEME_KEY);

  if (THEME_OPTIONS.some((option) => option.id === savedPalette)) {
    return savedPalette;
  }

  if (savedPalette === 'dark') return 'dark-midnight';
  if (savedPalette === 'light') return 'light-ocean';

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark-midnight'
    : 'light-ocean';
}

export function ThemeProvider({ children }) {
  const [palette, setPalette] = useState(getInitialPalette);
  const theme = palette.startsWith('dark-') ? 'dark' : 'light';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.palette = palette;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, palette);
  }, [palette, theme]);

  const toggleTheme = useCallback(() => {
    setPalette((current) => current.startsWith('dark-') ? 'light-ocean' : 'dark-midnight');
  }, []);

  const value = useMemo(
    () => ({ theme, palette, setPalette, toggleTheme }),
    [theme, palette, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
