import { z } from 'zod';
import AppError from '../utils/AppError.js';
import ROLES from '../constants/roles.js';

const branchIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

const setBranchContext = (req, res, next) => {
  const requestedBranchIds = [
    req.params?.branchId,
    req.query?.branchId,
    req.body?.branchId,
  ].filter(
    (branchId) =>
      branchId !== undefined && branchId !== null && branchId !== '',
  );

  const invalidBranchId = requestedBranchIds.some(
    (branchId) => !branchIdSchema.safeParse(branchId).success,
  );

  if (invalidBranchId) {
    return next(new AppError('Invalid branch ID', 400));
  }

  const normalizedBranchIds = requestedBranchIds.map((branchId) =>
    branchId.toLowerCase(),
  );

  if (new Set(normalizedBranchIds).size > 1) {
    return next(new AppError('Conflicting branch IDs were provided', 400));
  }

  const requestedBranchId = requestedBranchIds[0] ?? null;

  if (req.user.role === ROLES.ADMIN) {
    req.branchId = requestedBranchId;
    return next();
  }

  if (req.user.role === ROLES.SELLER) {
    if (!req.user.branch) {
      return next(new AppError('Seller is not assigned to a branch', 403));
    }

    const ownBranchId = req.user.branch.toString().toLowerCase();

    if (normalizedBranchIds.some((branchId) => branchId !== ownBranchId)) {
      return next(new AppError('Access denied to this branch', 403));
    }

    req.branchId = req.user.branch.toString();
    return next();
  }

  return next(new AppError('Access denied', 403));
};

export default setBranchContext;
