import { useState } from 'react';
import { FiCheck, FiDroplet } from 'react-icons/fi';
import { THEME_OPTIONS, useTheme } from '../../theme/ThemeContext.jsx';

export function ThemeToggle({ className = '' }) {
  const { palette, setPalette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectedTheme = THEME_OPTIONS.find((option) => option.id === palette);

  return (
    <div className="relative">
      <button
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 ${className}`}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="انتخاب پوسته"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title={selectedTheme ? `پوسته فعلی: ${selectedTheme.name}` : 'انتخاب پوسته'}
      >
        <FiDroplet aria-hidden="true" size={18} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
          role="dialog"
          aria-label="انتخاب پوسته رنگی"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <strong className="text-sm text-slate-900 dark:text-slate-100">انتخاب پوسته</strong>
            <button
              className="text-xs text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              بستن
            </button>
          </div>

          <p className="mb-2 px-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">تم‌های روشن</p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {THEME_OPTIONS.filter((option) => option.mode === 'light').map((option) => (
              <button
                key={option.id}
                className={`flex min-h-11 items-center gap-2 rounded-xl border px-2.5 text-xs transition ${palette === option.id ? 'border-indigo-500 bg-indigo-50 font-bold text-slate-900 dark:border-indigo-400 dark:bg-indigo-950 dark:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                type="button"
                onClick={() => {
                  setPalette(option.id);
                  setIsOpen(false);
                }}
                aria-pressed={palette === option.id}
              >
                <span className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white ring-offset-1 ring-offset-slate-200 dark:ring-offset-slate-700" style={{ backgroundColor: option.color }} />
                <span className="flex-1 text-right">{option.name}</span>
                {palette === option.id && <FiCheck size={14} />}
              </button>
            ))}
          </div>

          <p className="mb-2 px-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">تم‌های تیره</p>
          <div className="grid grid-cols-2 gap-2">
            {THEME_OPTIONS.filter((option) => option.mode === 'dark').map((option) => (
              <button
                key={option.id}
                className={`flex min-h-11 items-center gap-2 rounded-xl border px-2.5 text-xs transition ${palette === option.id ? 'border-indigo-500 bg-indigo-50 font-bold text-slate-900 dark:border-indigo-400 dark:bg-indigo-950 dark:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                type="button"
                onClick={() => {
                  setPalette(option.id);
                  setIsOpen(false);
                }}
                aria-pressed={palette === option.id}
              >
                <span className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white ring-offset-1 ring-offset-slate-200 dark:ring-offset-slate-700" style={{ backgroundColor: option.color }} />
                <span className="flex-1 text-right">{option.name}</span>
                {palette === option.id && <FiCheck size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
