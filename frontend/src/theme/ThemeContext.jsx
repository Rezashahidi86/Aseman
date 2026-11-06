import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'aseman_theme';

export const themes = [
  { id: 'sapphire-light', name: 'آبی یاقوتی', mode: 'light', colors: ['#f4f7ff', '#3157d5', '#172f83'] },
  { id: 'lagoon-light', name: 'فیروزه‌ای عمیق', mode: 'light', colors: ['#f0fbfa', '#0f8b8d', '#07565f'] },
  { id: 'orchid-light', name: 'یاسی مدرن', mode: 'light', colors: ['#f8f5ff', '#7656c9', '#432477'] },
  { id: 'sunset-light', name: 'غروب آفتاب', mode: 'light', colors: ['#fff7ed', '#ea580c', '#b91c1c'] },
  { id: 'midnight-dark', name: 'نیمه‌شب آبی', mode: 'dark', colors: ['#0d1424', '#7aa2ff', '#294b9b'] },
  { id: 'plum-dark', name: 'آلویی', mode: 'dark', colors: ['#191323', '#c4a1ff', '#7045a5'] },
  { id: 'jade-dark', name: 'یشمی', mode: 'dark', colors: ['#0d201d', '#55d6b0', '#187b68'] },
  { id: 'sunset-dark', name: 'غروب آتشین', mode: 'dark', colors: ['#241614', '#ffad70', '#c94732'] },
];

const legacyThemes = {
  'ocean-light': 'sapphire-light',
  'violet-light': 'orchid-light',
  'emerald-light': 'lagoon-light',
  'teal-light': 'lagoon-light',
  'navy-dark': 'midnight-dark',
  'violet-dark': 'plum-dark',
  'graphite-dark': 'midnight-dark',
  'forest-dark': 'jade-dark',
};

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (themes.some((item) => item.id === savedTheme)) return savedTheme;
  if (legacyThemes[savedTheme]) return legacyThemes[savedTheme];
  if (savedTheme === 'dark') return 'midnight-dark';
  if (savedTheme === 'light') return 'sapphire-light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'midnight-dark' : 'sapphire-light';
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
      return themes.find((item) => item.mode === nextMode).id;
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
