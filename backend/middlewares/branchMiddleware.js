import AppError from '../utils/AppError.js';
import ROLES from '../constants/roles.js';

const setBranchContext = (req, res, next) => {
  if (req.user.role === ROLES.ADMIN) {
    req.branchId = req.headers['x-branch-id'] || req.params?.id || req.query?.branchId || req.body?.branchId || null;
    return next();
  }

  if (req.user.role === ROLES.SELLER) {
    if (!req.user.branch) {
      return next(new AppError('Seller is not assigned to a branch', 403));
    }

    const ownBranchId = req.user.branch.toString();

    if (
      (req.body?.branchId && req.body?.branchId !== ownBranchId) ||
      (req.params?.id && req.params?.id !== ownBranchId)
    ) {
      return next(new AppError('Access denied to this branch', 403));
    }

    req.branchId = ownBranchId;
    return next();
  }

  return next(new AppError('Access denied', 403));
};

export default setBranchContext;
