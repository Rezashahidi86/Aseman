import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiChevronDown, FiMapPin } from 'react-icons/fi';
import { showError } from '../../../shared/utils/notifications.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';

export function BranchSelector() {
  const { user } = useAuth();
  const { branches, activeBranchId, isLoadingBranches, branchError, chooseBranch, reloadBranches } = useActiveBranch();
  const [isChanging, setIsChanging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [menuPosition, setMenuPosition] = useState(null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    showError(error || branchError);
  }, [error, branchError]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
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

  if (user?.role !== 'ADMIN') return null;

  const activeBranch = branches.find((branch) => String(branch._id || branch.id) === String(activeBranchId));
  const isDisabled = isLoadingBranches || isChanging || branches.length === 0;

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = Math.min(256, window.innerWidth - 24);
    const estimatedHeight = Math.min(300, 58 + branches.length * 56);
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight;
    const top = openAbove ? Math.max(12, rect.top - estimatedHeight - 8) : rect.bottom + 8;
    const right = Math.max(12, window.innerWidth - rect.right);

    setMenuPosition({ top, right, width, maxHeight: Math.max(140, openAbove ? rect.top - 24 : window.innerHeight - rect.bottom - 24) });
    setIsOpen(true);
  };

  const handleChange = async (branchId) => {
    if (!branchId || String(branchId) === String(activeBranchId)) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    setError('');
    setIsOpen(false);

    try {
      await chooseBranch(branchId);
    } catch (changeError) {
      setError(changeError.message || 'تغییر شعبه انجام نشد.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative z-40 flex min-w-0 flex-col gap-1">
      <button
        ref={triggerRef}
        id="active-branch"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="active-branch-options"
        disabled={isDisabled}
        onClick={toggleMenu}
        className="group flex min-h-11 w-full min-w-0 max-w-60 items-center gap-2.5 rounded-xl border px-3 py-2 text-right text-xs font-semibold shadow-sm outline-none transition hover:-translate-y-px hover:shadow-md focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: isOpen ? 'var(--color-primary)' : 'var(--color-border)',
          color: 'var(--color-text)',
          boxShadow: isOpen ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 13%, transparent)' : undefined,
        }}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
          <FiMapPin size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>شعبه فعال</span>
          <span className="mt-0.5 block truncate text-xs font-bold">
            {isLoadingBranches ? 'در حال دریافت شعبه‌ها...' : isChanging ? 'در حال تغییر شعبه...' : activeBranch?.name || 'انتخاب شعبه'}
          </span>
        </span>
        <FiChevronDown className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={16} style={{ color: 'var(--color-muted)' }} />
      </button>

      {isOpen && menuPosition && createPortal(
        <div
          ref={menuRef}
          id="active-branch-options"
          role="listbox"
          aria-label="انتخاب شعبه"
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
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>شعبه موردنظر</span>
            <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{branches.length} شعبه</span>
          </div>
          <div className="space-y-1 overflow-y-auto" style={{ maxHeight: Math.max(90, menuPosition.maxHeight - 48) }}>
            {branches.map((branch) => {
              const branchId = branch._id || branch.id;
              const isActive = String(branchId) === String(activeBranchId);

              return (
                <button
                  key={branchId}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleChange(branchId)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-right transition"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  }}
                  onMouseEnter={(event) => {
                    if (!isActive) event.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
                  }}
                  onMouseLeave={(event) => {
                    if (!isActive) event.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: isActive ? 'color-mix(in srgb, var(--color-primary) 14%, transparent)' : 'var(--color-surface-muted)', color: 'var(--color-primary)' }}>
                    <FiMapPin size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">{branch.name}</span>
                    {branch.code && <span className="mt-0.5 block text-[10px]" style={{ color: 'var(--color-muted)' }}>کد شعبه: {branch.code}</span>}
                  </span>
                  {isActive && <FiCheck className="shrink-0" size={16} />}
                </button>
              );
            })}
            {branches.length === 0 && <p className="px-3 py-4 text-center text-xs" style={{ color: 'var(--color-muted)' }}>شعبه‌ای یافت نشد.</p>}
          </div>
        </div>,
        document.body
      )}

      {(error || branchError) && (
        <button className="self-start text-[10px] text-rose-600 underline dark:text-rose-400" type="button" onClick={reloadBranches}>
          تلاش دوباره
        </button>
      )}
    </div>
  );
}
