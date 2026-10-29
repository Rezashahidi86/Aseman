import AppError from '../utils/AppError.js';
import ROLES from '../constants/roles.js';

const setBranchContext = (req, res, next) => {
  const requestedBranchId =
    req.params?.branchId ||
    req.params?.id ||
    req.query?.branchId ||
    req.body?.branchId ||
    null;

  if (req.user.role === ROLES.ADMIN) {
    req.branchId = requestedBranchId;
    return next();
  }

  if (req.user.role === ROLES.SELLER) {
    if (!req.user.branch) {
      return next(new AppError('Seller is not assigned to a branch', 403));
    }

    const ownBranchId = req.user.branch.toString();

    if (requestedBranchId && requestedBranchId !== ownBranchId) {
      return next(new AppError('Access denied to this branch', 403));
    }

    req.branchId = ownBranchId;
    return next();
  }

  return next(new AppError('Access denied', 403));
};

export default setBranchContext;
