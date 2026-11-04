import { useState } from 'react';
import { FiCheck, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { useTheme } from '../../theme/ThemeContext.jsx';

export function ThemeToggle({ className = '' }) {
  const { theme, mode, themes, selectTheme } = useTheme();
  const [open, setOpen] = useState(false);
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
          setOpen(false);
        }}
        aria-pressed={active}
        className={`flex min-w-0 items-center gap-3 rounded-xl border p-2.5 text-right transition ${active ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' : 'border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'}`}
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="انتخاب پوسته"
        title="انتخاب پوسته"
        className={`flex h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--color-text)] shadow-sm transition hover:border-[var(--color-primary)] ${className}`}
      >
        {mode === 'dark' ? <FiMoon size={17} /> : <FiSun size={17} />}
        <span className="text-xs font-semibold">پوسته</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="theme-modal-title" className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
            <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <h2 id="theme-modal-title" className="text-sm font-extrabold text-[var(--color-text)]">انتخاب تم برنامه</h2>
                <p className="mt-1 text-[11px] text-[var(--color-muted)]">رنگ دلخواه محیط آسمان را انتخاب کنید</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="بستن" className="grid h-9 w-9 place-items-center rounded-xl text-[var(--color-muted)] transition hover:bg-[var(--color-surface-muted)]"><FiX size={18} /></button>
            </header>
            <div className="grid max-h-[min(70vh,560px)] grid-cols-1 gap-5 overflow-y-auto p-5 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-[var(--color-text)]"><FiSun size={15} /> تم‌های روشن</h3>
                <div className="grid gap-2">{lightThemes.map(renderTheme)}</div>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-[var(--color-text)]"><FiMoon size={15} /> تم‌های تیره</h3>
                <div className="grid gap-2">{darkThemes.map(renderTheme)}</div>
              </div>
            </div>
            <footer className="flex justify-end border-t border-[var(--color-border)] px-5 py-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-[var(--color-primary)] px-5 py-2 text-xs font-bold text-white">بستن</button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
