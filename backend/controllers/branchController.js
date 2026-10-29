import Branch from '../models/Branch.js';
import ROLES from '../constants/roles.js';
import AppError from '../utils/AppError.js';
import validateMongoId from '../utils/validateMongoId.js';
import { createBranchSchema, updateBranchStatusSchema } from '../validators/branchValidators.js';

export const getBranches = async (req, res, next) => {
  try {
    let branches;

    if (req.user.role === ROLES.ADMIN) {
      branches = await Branch.find()
        .select('name code isActive createdAt')
        .sort({ createdAt: 1, _id: 1 })
        .lean();
    } else {
      if (!req.user.branch) {
        throw new AppError('Seller is not assigned to a branch', 403);
      }

      branches = await Branch.find({
        _id: req.user.branch,
        isActive: true,
      })
        .select('name code isActive')
        .lean();
    }

    res.status(200).json({
      status: 'success',
      results: branches.length,
      data: { branches },
    });
  } catch (error) {
    next(error);
  }
};

export const selectBranch = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      throw new AppError('Only admins can select a branch', 403);
    }

    const { branchId } = req.body;

    if (!branchId || !/^[a-f\d]{24}$/i.test(branchId)) {
      throw new AppError('A valid branch ID is required', 400);
    }

    const branch = await Branch.findOne({
      _id: branchId,
      isActive: true,
    }).select('name code isActive');

    if (!branch) {
      throw new AppError('Branch not found or inactive', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        branch,
        branchId: branch._id.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBranchById = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);
    const branch = await Branch.findById(req.params.id)
      .select('name code isActive createdAt')
      .lean();

    if (!branch) {
      throw new AppError('Branch not found', 404);
    }

    if (
      req.user.role === ROLES.SELLER &&
      req.user.branch?.toString() !== branch._id.toString()
    ) {
      throw new AppError('Access denied to this branch', 403);
    }

    res.status(200).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const validation = createBranchSchema.safeParse(req.body);

    if (!validation.success) {
      return next(new AppError('Invalid branch data', 400));
    }

    const { name, code } = validation.data;
    const existingBranch = await Branch.findOne({ code });

    if (existingBranch) {
      return next(new AppError('Branch code already exists', 409));
    }

    const branch = await Branch.create({ name, code });

    return res.status(201).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Branch code already exists', 409));
    }

    return next(error);
  }
};

export const updateBranchStatus = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);
    const validation = updateBranchStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return next(new AppError('A valid isActive boolean is required', 400));
    }

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { isActive: validation.data.isActive },
      { new: true, runValidators: true },
    ).select('name code isActive createdAt');

    if (!branch) {
      return next(new AppError('Branch not found', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    return next(error);
  }
};
