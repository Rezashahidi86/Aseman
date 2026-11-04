import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiChevronDown, FiSearch, FiX } from 'react-icons/fi';

const inputClass = 'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950';

const stockOptions = [
  { value: 'all', label: 'همه محصولات', description: 'نمایش تمام محصولات' },
  { value: 'low', label: 'موجودی کم', description: 'محصولات با موجودی پایین' },
  { value: 'available', label: 'موجودی کافی', description: 'محصولات با موجودی مناسب' },
];

const sortOptions = [
  { value: '-createdAt', label: 'جدیدترین', description: 'محصولات تازه ثبت‌شده' },
  { value: 'name', label: 'نام محصول', description: 'مرتب‌سازی بر اساس نام' },
  { value: '-salePrice', label: 'گران‌ترین فروش', description: 'از بیشترین قیمت فروش' },
  { value: 'salePrice', label: 'ارزان‌ترین فروش', description: 'از کمترین قیمت فروش' },
  { value: 'quantity', label: 'کمترین موجودی', description: 'از موجودی کمتر' },
  { value: '-quantity', label: 'بیشترین موجودی', description: 'از موجودی بیشتر' },
];

function FilterSelect({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
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
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = Math.min(Math.max(rect.width, 220), window.innerWidth - 24);
    const estimatedHeight = Math.min(310, 58 + options.length * 58);
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight;
    const top = openAbove ? Math.max(12, rect.top - estimatedHeight - 8) : rect.bottom + 8;
    const right = Math.max(12, window.innerWidth - rect.right);

    setMenuPosition({
      top,
      right,
      width,
      maxHeight: Math.max(140, openAbove ? rect.top - 24 : window.innerHeight - rect.bottom - 24),
    });
    setIsOpen(true);
  };

  const chooseOption = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="relative mt-2 min-w-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className="flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-right text-xs font-semibold shadow-sm outline-none transition hover:-translate-y-px hover:shadow-md focus-visible:ring-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: isOpen ? 'var(--color-primary)' : 'var(--color-border)',
          color: 'var(--color-text)',
          boxShadow: isOpen ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 13%, transparent)' : undefined,
        }}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold">{selected.label}</span>
          <span className="mt-0.5 block truncate text-[10px] font-normal" style={{ color: 'var(--color-muted)' }}>{selected.description}</span>
        </span>
        <FiChevronDown className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={16} style={{ color: 'var(--color-muted)' }} />
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
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => chooseOption(option.value)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-right transition hover:-translate-y-px"
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
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold">{option.label}</span>
                    <span className="mt-0.5 block text-[10px]" style={{ color: 'var(--color-muted)' }}>{option.description}</span>
                  </span>
                  {isSelected && <FiCheck className="shrink-0" size={16} />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function ProductFilters({ filters, onChange, onApply, onReset }) {
  const update = (event) => onChange((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateFilter = (name, value) => onChange((current) => ({ ...current, [name]: value }));

  return (
    <form className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(160px,0.8fr)_180px_150px_auto] xl:items-end dark:border-slate-800 dark:bg-slate-900" onSubmit={(event) => { event.preventDefault(); onApply(); }}>
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">جست‌وجوی نام محصول
        <span className="relative mt-2 block"><FiSearch className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} /><input className={`${inputClass} pr-9`} name="name" value={filters.name} onChange={update} placeholder="نام محصول..." maxLength={100} /></span>
      </label>
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">بارکد
        <input className={inputClass + ' mt-2'} name="barcode" value={filters.barcode} onChange={update} placeholder="جست‌وجوی بارکد" maxLength={100} />
      </label>
      <div className="block min-w-0 text-[11px] font-bold text-slate-600 dark:text-slate-300">وضعیت موجودی
        <FilterSelect label="وضعیت موجودی" value={filters.stock} options={stockOptions} onChange={(value) => updateFilter('stock', value)} />
      </div>
      <div className="block min-w-0 text-[11px] font-bold text-slate-600 dark:text-slate-300">مرتب‌سازی
        <FilterSelect label="مرتب‌سازی" value={filters.sort} options={sortOptions} onChange={(value) => updateFilter('sort', value)} />
      </div>
      <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
        <button className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-700" type="submit"><FiSearch size={15} /> جست‌وجو</button>
        <button className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" type="button" onClick={onReset}><FiX size={15} /> پاک‌کردن</button>
      </div>
    </form>
  );
}
