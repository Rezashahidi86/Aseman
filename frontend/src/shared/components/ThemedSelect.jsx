import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

export function ThemedSelect({ label, value, options, onChange, disabled = false, placeholder = 'Select' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value));

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => { if (event.key === 'Escape') setIsOpen(false); };
    const closeOnViewportChange = () => setIsOpen(false);
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnViewportChange);
    window.addEventListener('scroll', closeOnViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnViewportChange);
      window.removeEventListener('scroll', closeOnViewportChange, true);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (disabled) return;
    if (isOpen) { setIsOpen(false); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(Math.max(rect.width, 220), window.innerWidth - 24);
    const estimatedHeight = Math.min(310, 58 + options.length * 58);
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight;
    setMenuPosition({
      top: openAbove ? Math.max(12, rect.top - estimatedHeight - 8) : rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
      width,
      maxHeight: Math.max(140, openAbove ? rect.top - 24 : window.innerHeight - rect.bottom - 24),
    });
    setIsOpen(true);
  };

  return (
    <div ref={rootRef} className="relative mt-2 min-w-0">
      <button ref={triggerRef} type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={isOpen} disabled={disabled} onClick={toggleMenu}
        className="flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-right text-xs font-semibold shadow-sm outline-none transition hover:-translate-y-px hover:shadow-md focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: isOpen ? 'var(--color-primary)' : 'var(--color-border)', color: disabled ? 'var(--color-muted)' : 'var(--color-text)', boxShadow: isOpen ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 13%, transparent)' : undefined }}>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold">{selected?.label || placeholder}</span>
          {selected?.description && <span className="mt-0.5 block truncate text-[10px] font-normal" style={{ color: 'var(--color-muted)' }}>{selected.description}</span>}
        </span>
        <FiChevronDown className={'shrink-0 transition-transform duration-200 ' + (isOpen ? 'rotate-180' : '')} size={16} style={{ color: 'var(--color-muted)' }} />
      </button>
      {isOpen && menuPosition && createPortal(
        <div ref={menuRef} role="listbox" aria-label={label} className="overflow-hidden rounded-2xl border p-1.5"
          style={{ position: 'fixed', top: menuPosition.top, right: menuPosition.right, width: menuPosition.width, maxHeight: menuPosition.maxHeight, zIndex: 2147483000, backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: '0 18px 45px rgb(15 23 42 / 22%)' }}>
          <div className="flex items-center justify-between px-3 pb-2 pt-2">
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>{label}</span>
            <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{options.length}</span>
          </div>
          <div className="space-y-1 overflow-y-auto" style={{ maxHeight: Math.max(90, menuPosition.maxHeight - 48) }}>
            {options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return <button key={String(option.value)} type="button" role="option" aria-selected={isSelected} onClick={() => { onChange(option.value); setIsOpen(false); }}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-right transition"
                style={{ backgroundColor: isSelected ? 'var(--color-primary-soft)' : 'transparent', color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}
                onMouseEnter={(event) => { if (!isSelected) event.currentTarget.style.backgroundColor = 'var(--color-surface-muted)'; }}
                onMouseLeave={(event) => { if (!isSelected) event.currentTarget.style.backgroundColor = 'transparent'; }}>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold">{option.label}</span>
                  {option.description && <span className="mt-0.5 block text-[10px]" style={{ color: 'var(--color-muted)' }}>{option.description}</span>}
                </span>
                {isSelected && <FiCheck className="shrink-0" size={16} />}
              </button>;
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}