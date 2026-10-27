import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../theme/ThemeContext.jsx';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = isDark ? FiSun : FiMoon;

  return (
    <button
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 ${className}`}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
      title={isDark ? 'تم روشن' : 'تم تیره'}
    >
      <Icon aria-hidden="true" size={18} />
    </button>
  );
}
