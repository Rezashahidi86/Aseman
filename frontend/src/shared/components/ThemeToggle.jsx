import { useState } from 'react';
import { FiCheck, FiChevronDown, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../theme/ThemeContext.jsx';

export function ThemeToggle({ className = '' }) {
  const { theme, mode, themes, selectTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const lightThemes = themes.filter((item) => item.mode === 'light');
  const darkThemes = themes.filter((item) => item.mode === 'dark');

  const renderTheme = (item) => {
    const active = theme === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          selectTheme(item.id);
          setIsOpen(false);
        }}
        aria-pressed={active}
        className={`flex w-full items-center gap-2.5 rounded-xl border p-2 text-right transition ${active ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' : 'border-transparent hover:bg-[var(--color-surface-muted)]'}`}
      >
        <span className="flex shrink-0 overflow-hidden rounded-lg border border-black/10">
          {item.colors.map((color) => <span key={color} className="h-7 w-3.5" style={{ backgroundColor: color }} />)}
        </span>
        <span className="min-w-0 flex-1 text-xs font-semibold text-[var(--color-text)]">{item.name}</span>
        {active && <FiCheck className="shrink-0 text-[var(--color-primary)]" size={16} />}
      </button>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-label="انتخاب پوسته"
        title="انتخاب پوسته"
        className="flex h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--color-text)] shadow-sm transition hover:border-[var(--color-primary)]"
      >
        {mode === 'dark' ? <FiMoon size={17} /> : <FiSun size={17} />}
        <span className="hidden text-xs font-semibold sm:inline">پوسته</span>
        <FiChevronDown size={14} />
      </button>
      {isOpen && (
        <>
          <button type="button" aria-label="بستن انتخاب پوسته" className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-[var(--color-text)]">پوسته‌های روشن</span>
              <FiSun className="text-[var(--color-muted)]" size={15} />
            </div>
            <div className="grid gap-1">{lightThemes.map(renderTheme)}</div>
            <div className="mb-2 mt-4 flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-[var(--color-text)]">پوسته‌های تیره</span>
              <FiMoon className="text-[var(--color-muted)]" size={15} />
            </div>
            <div className="grid gap-1">{darkThemes.map(renderTheme)}</div>
            <button type="button" onClick={toggleTheme} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-soft)] text-xs font-bold text-[var(--color-primary)]">
              {mode === 'dark' ? <FiSun size={15} /> : <FiMoon size={15} />}
              تغییر سریع حالت روشن / تیره
            </button>
          </div>
        </>
      )}
    </div>
  );
}
