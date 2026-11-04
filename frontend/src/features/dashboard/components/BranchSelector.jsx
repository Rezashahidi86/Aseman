import { useEffect, useState } from 'react';
import { showError } from '../../../shared/utils/notifications.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';

export function BranchSelector() {
  const { user } = useAuth();
  const { branches, activeBranchId, isLoadingBranches, branchError, chooseBranch, reloadBranches } = useActiveBranch();
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { showError(error || branchError); }, [error, branchError]);

  if (user?.role !== 'ADMIN') return null;

  const handleChange = async (event) => {
    const branchId = event.target.value;
    if (!branchId || branchId === activeBranchId) return;

    setIsChanging(true);
    setError('');

    try {
      await chooseBranch(branchId);
    } catch (changeError) {
      setError(changeError.message || 'تغییر شعبه انجام نشد.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <select
        id="active-branch"
        className="theme-select min-h-11 max-w-56 rounded-xl border px-4 text-xs font-bold outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
        value={activeBranchId}
        onChange={handleChange}
        disabled={isLoadingBranches || isChanging || branches.length === 0}
      >
        <option value="">{isLoadingBranches ? 'در حال دریافت شعبه‌ها...' : 'انتخاب شعبه'}</option>
        {branches.map((branch) => (
          <option key={branch._id || branch.id} value={branch._id || branch.id}>{branch.name} ({branch.code})</option>
        ))}
      </select>
      {(error || branchError) && <button className="self-start text-[10px] text-rose-600 underline dark:text-rose-400" type="button" onClick={reloadBranches}>تلاش دوباره</button>}
    </div>
  );
}
