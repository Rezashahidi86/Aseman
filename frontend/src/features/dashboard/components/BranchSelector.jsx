import { useEffect, useRef, useState } from 'react';
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    showError(error || branchError);
  }, [error, branchError]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (user?.role !== 'ADMIN') return null;

  const activeBranch = branches.find((branch) => String(branch._id || branch.id) === String(activeBranchId));
  const isDisabled = isLoadingBranches || isChanging || branches.length === 0;

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
        id="active-branch"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="active-branch-options"
        disabled={isDisabled}
        onClick={() => setIsOpen((current) => !current)}
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

      {isOpen && (
        <div
          id="active-branch-options"
          role="listbox"
          aria-label="انتخاب شعبه"
          className="absolute right-0 top-[calc(100%+8px)] z-[100] w-64 max-w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border p-1.5 shadow-2xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: '0 18px 45px rgb(15 23 42 / 18%)',
          }}
        >
          <div className="flex items-center justify-between px-3 pb-2 pt-2">
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>شعبه موردنظر</span>
            <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{branches.length} شعبه</span>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
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
        </div>
      )}

      {(error || branchError) && (
        <button className="self-start text-[10px] text-rose-600 underline dark:text-rose-400" type="button" onClick={reloadBranches}>
          تلاش دوباره
        </button>
      )}
    </div>
  );
}
