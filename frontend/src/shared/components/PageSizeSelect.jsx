import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiChevronDown, FiList } from 'react-icons/fi';

export function PageSizeSelect({ value, options, onChange, label = 'تعداد در صفحه' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const handleViewportChange = () => setIsOpen(false);

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = Math.min(220, window.innerWidth - 24);
    const estimatedHeight = Math.min(260, 58 + options.length * 52);
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
    <div ref={rootRef} className="relative inline-flex min-w-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className="group flex min-h-9 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-right text-xs font-semibold shadow-sm outline-none transition hover:-translate-y-px hover:shadow-md focus-visible:ring-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: isOpen ? 'var(--color-primary)' : 'var(--color-border)',
          color: 'var(--color-text)',
          boxShadow: isOpen ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 13%, transparent)' : undefined,
        }}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
          <FiList size={14} />
        </span>
        <span className="min-w-0">
          <span className="block text-[9px] font-medium" style={{ color: 'var(--color-muted)' }}>{label}</span>
          <span className="block text-xs font-bold">{new Intl.NumberFormat('fa-IR').format(value)}</span>
        </span>
        <FiChevronDown className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={15} style={{ color: 'var(--color-muted)' }} />
      </button>

      {isOpen && menuPosition && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={label}
          className="overflow-hidden rounded-2xl border p-1.5"
          style={{
            position: 'fixed',
            top: menuPosition.top,
            right: menuPosition.right,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
            zIndex: 2147483000,
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: '0 18px 45px rgb(15 23 42 / 22%)',
          }}
        >
          <div className="flex items-center justify-between px-3 pb-2 pt-2">
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>{label}</span>
            <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{options.length} گزینه</span>
          </div>
          <div className="space-y-1 overflow-y-auto" style={{ maxHeight: Math.max(90, menuPosition.maxHeight - 48) }}>
            {options.map((option) => {
              const isSelected = Number(option.value) === Number(value);

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-right transition"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary-soft)' : 'transparent',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                  }}
                  onMouseEnter={(event) => {
                    if (!isSelected) event.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
                  }}
                  onMouseLeave={(event) => {
                    if (!isSelected) event.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span className="min-w-0 flex-1 text-xs font-bold">{option.label}</span>
                  {isSelected && <FiCheck className="shrink-0" size={16} />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
