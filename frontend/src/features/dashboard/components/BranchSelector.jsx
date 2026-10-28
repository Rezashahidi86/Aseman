import { useState } from 'react';
import { FiGitBranch } from 'react-icons/fi';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';

export function BranchSelector() {
  const { user } = useAuth();
  const { branches, activeBranchId, isLoadingBranches, branchError, chooseBranch, reloadBranches } = useActiveBranch();
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');

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
      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400" htmlFor="active-branch">
        <FiGitBranch size={14} aria-hidden="true" />
        شعبه فعال
      </label>
      <select
        id="active-branch"
        className="min-h-10 max-w-56 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950"
        value={activeBranchId}
        onChange={handleChange}
        disabled={isLoadingBranches || isChanging || branches.length === 0}
        aria-describedby={error || branchError ? 'active-branch-error' : undefined}
      >
        <option value="">{isLoadingBranches ? 'در حال دریافت شعبه‌ها...' : 'انتخاب شعبه'}</option>
        {branches.map((branch) => (
          <option key={branch._id || branch.id} value={branch._id || branch.id}>{branch.name} ({branch.code})</option>
        ))}
      </select>
      {(error || branchError) && (
        <div className="text-[10px] text-rose-600 dark:text-rose-400" id="active-branch-error">
          {error || branchError}
          <button className="mr-2 underline" type="button" onClick={reloadBranches}>تلاش دوباره</button>
        </div>
      )}
    </div>
  );
}
