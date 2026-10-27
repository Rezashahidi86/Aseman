import { useTheme } from '../../theme/ThemeContext.jsx';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
      title={isDark ? 'تم روشن' : 'تم تیره'}
    >
      <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
    </button>
  );
}
