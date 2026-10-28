import { useEffect, useRef } from 'react';
import { FiCamera, FiSearch } from 'react-icons/fi';

export function BarcodeScannerInput({ value, onChange, onScan, disabled }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const focusInput = (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))) return;
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', focusInput);
    return () => window.removeEventListener('keydown', focusInput);
  }, []);

  return (
    <form className="flex min-w-0 flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); onScan(value.trim()); }}>
      <label className="relative block min-w-0 flex-1">
        <FiCamera className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          className="min-h-12 w-full rounded-xl border border-indigo-200 bg-indigo-50/60 px-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-white dark:focus:ring-indigo-950"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="بارکد را اسکن کنید یا وارد کنید..."
          aria-label="ورودی اسکن بارکد"
          autoComplete="off"
          inputMode="numeric"
          maxLength={100}
          disabled={disabled}
        />
      </label>
      <button className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50" type="submit" disabled={disabled || !value.trim()}><FiSearch size={16} /> افزودن با بارکد</button>
    </form>
  );
}
