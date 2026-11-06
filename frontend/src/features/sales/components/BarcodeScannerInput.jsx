import { useEffect, useRef } from 'react';
import { FiCamera, FiSearch } from 'react-icons/fi';

export function BarcodeScannerInput({ value, onChange, onScan, disabled }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const focusInput = (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))) return;
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', focusInput);
    return () => window.removeEventListener('keydown', focusInput);
  }, []);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <form className="flex min-w-0 flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); onScan(value.trim()); }}>
      <label className="relative block min-w-0 flex-1">
        <FiCamera
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--color-primary)' }}
          size={18}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          className="barcode-scanner-input min-h-12 w-full rounded-xl border px-10 text-sm outline-none transition focus:ring-2 disabled:opacity-60"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            '--tw-ring-color': 'var(--color-ring)',
          }}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="بارکد را اسکن کنید یا وارد کنید..."
          aria-label="ورودی اسکن بارکد"
          autoComplete="off"
          autoFocus
          inputMode="numeric"
          maxLength={100}
          disabled={disabled}
        />
      </label>
      <button className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50" type="submit" disabled={disabled || !value.trim()}><FiSearch size={16} /> افزودن با بارکد</button>
    </form>
  );
}
