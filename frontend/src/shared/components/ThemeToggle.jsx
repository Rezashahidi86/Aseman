import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { useTheme } from '../../theme/ThemeContext.jsx';

export function ThemeToggle({ className = '' }) {
  const { theme, mode, themes, selectTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const lightThemes = themes.filter((item) => item.mode === 'light');
  const darkThemes = themes.filter((item) => item.mode === 'dark');

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

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
        aria-label={item.name}
        aria-pressed={active}
        className={`relative min-w-0 rounded-xl border p-1.5 text-right transition hover:-translate-y-0.5 ${active ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : 'hover:shadow-md'}`}
      >
        <span
          className="relative flex h-14 w-full items-end overflow-hidden rounded-lg border p-1.5"
          style={{ backgroundColor: item.colors[0], borderColor: item.colors[1] }}
        >
          <span className="h-2.5 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${item.colors[1]}, ${item.colors[2]})` }} />
        </span>
        {active && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-slate-900 shadow"><FiCheck size={14} /></span>}
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
      {open && createPortal(
        <div
          className="fixed inset-0 z-[2147483000] grid place-items-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-md sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-modal-title"
            className="my-auto flex max-h-[min(82dvh,620px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3.5 sm:px-5">
              <div>
                <h2 id="theme-modal-title" className="text-sm font-extrabold text-[var(--color-text)]">انتخاب تم برنامه</h2>
                <p className="mt-1 text-[11px] text-[var(--color-muted)]">ظاهر دلخواه آسمان را انتخاب کنید</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="بستن" className="grid h-9 w-9 place-items-center rounded-xl text-[var(--color-muted)] transition hover:bg-[var(--color-surface-muted)]">
                <FiX size={18} />
              </button>
            </header>
            <div className="grid min-h-0 grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
              <div>
                <h3 className="mb-2.5 flex items-center gap-2 text-xs font-bold text-[var(--color-text)]"><FiSun size={15} /> تم‌های روشن</h3>
                <div className="grid grid-cols-3 gap-2">{lightThemes.map(renderTheme)}</div>
              </div>
              <div>
                <h3 className="mb-2.5 flex items-center gap-2 text-xs font-bold text-[var(--color-text)]"><FiMoon size={15} /> تم‌های تیره</h3>
                <div className="grid grid-cols-3 gap-2">{darkThemes.map(renderTheme)}</div>
              </div>
            </div>
            <footer className="flex shrink-0 justify-end border-t border-[var(--color-border)] px-4 py-3 sm:px-5">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-[var(--color-primary)] px-5 py-2 text-xs font-bold text-white">بستن</button>
            </footer>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
