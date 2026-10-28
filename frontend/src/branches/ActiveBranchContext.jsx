import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getBranches, selectBranch as selectBranchRequest } from '../api/services/branchService.js';
import { useAuth } from '../auth/AuthContext.jsx';

const ActiveBranchContext = createContext(null);
const STORAGE_KEY = 'aseman_active_branch_id';

function getBranchId(branch) {
  if (!branch) return '';
  return typeof branch === 'string' ? branch : branch._id || branch.id || '';
}

export function ActiveBranchProvider({ children }) {
  const { user, isInitializing } = useAuth();
  const [branches, setBranches] = useState([]);
  const [activeBranch, setActiveBranch] = useState(null);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [branchError, setBranchError] = useState('');

  const loadBranches = useCallback(async () => {
    if (!user || isInitializing) return;

    if (user.role !== 'ADMIN') {
      const ownBranch = typeof user.branch === 'object' ? user.branch : null;
      setBranches(ownBranch ? [ownBranch] : []);
      setActiveBranch(ownBranch || (user.branch ? { _id: user.branch, name: 'شعبه من' } : null));
      setBranchError('');
      return;
    }

    setIsLoadingBranches(true);
    setBranchError('');

    try {
      const response = await getBranches();
      const availableBranches = (response?.data?.branches || []).filter((branch) => branch.isActive);
      setBranches(availableBranches);

      const savedId = window.sessionStorage.getItem(STORAGE_KEY);
      const selected = availableBranches.find((branch) => getBranchId(branch) === savedId)
        || availableBranches[0]
        || null;

      if (selected) {
        const result = await selectBranchRequest(getBranchId(selected));
        const confirmedBranch = result?.data?.branch || selected;
        setActiveBranch(confirmedBranch);
        window.sessionStorage.setItem(STORAGE_KEY, getBranchId(confirmedBranch));
      } else {
        setActiveBranch(null);
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      setBranchError(error.message || 'دریافت فهرست شعبه‌ها ناموفق بود.');
      setBranches([]);
      setActiveBranch(null);
    } finally {
      setIsLoadingBranches(false);
    }
  }, [user, isInitializing]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const chooseBranch = useCallback(async (branchId) => {
    const result = await selectBranchRequest(branchId);
    const selected = result?.data?.branch || branches.find((branch) => getBranchId(branch) === branchId);

    if (!selected) throw new Error('شعبه انتخاب‌شده پیدا نشد.');

    setActiveBranch(selected);
    window.sessionStorage.setItem(STORAGE_KEY, getBranchId(selected));
    return selected;
  }, [branches]);

  const value = useMemo(() => ({
    branches,
    activeBranch,
    activeBranchId: getBranchId(activeBranch),
    isLoadingBranches,
    branchError,
    chooseBranch,
    reloadBranches: loadBranches,
  }), [branches, activeBranch, isLoadingBranches, branchError, chooseBranch, loadBranches]);

  return <ActiveBranchContext.Provider value={value}>{children}</ActiveBranchContext.Provider>;
}

export function useActiveBranch() {
  const context = useContext(ActiveBranchContext);

  if (!context) {
    throw new Error('useActiveBranch must be used within ActiveBranchProvider');
  }

  return context;
}
