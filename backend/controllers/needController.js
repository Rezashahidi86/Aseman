import mongoose from 'mongoose';
import Need from '../models/Need.js';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import AppError from '../utils/AppError.js';
import ROLES from '../constants/roles.js';
import pagination from '../utils/pagination.js';
import validateMongoId from '../utils/validateMongoId.js';
import {
  createNeedSchema,
} from '../validators/needValidators.js';

const getBranchId = (req, next) => {
  if (req.user.role === ROLES.SELLER) {
    if (!req.user.branch) {
      next(new AppError('Seller is not assigned to a branch', 403));
      return null;
    }

    return req.user.branch;
  }

  const branchId = req.branchId || req.query?.branchId || req.body?.branchId;

  if (!branchId || !mongoose.isValidObjectId(branchId)) {
    next(new AppError('A valid branchId is required', 400));
    return null;
  }

  return branchId;
};

const createNeed = async (req, res, next) => {
  try {
    const validation = createNeedSchema.safeParse(req.body);

    if (!validation.success) {
      return next(validation.error);
    }

    const branchId = getBranchId(req, next);

    if (!branchId) {
      return;
    }

    const branch = await Branch.findOne({
      _id: branchId,
      isActive: true,
    }).select('_id');

    if (!branch) {
      return next(new AppError('Branch not found or inactive', 404));
    }

    const product = await Product.findOne({
      _id: validation.data.productId,
      branch: branch._id,
    }).select('_id name');

    if (!product) {
      return next(
        new AppError('Product not found in the selected branch', 404),
      );
    }

    const need = await Need.create({
      product: product._id,
      productName: product.name,
      requestedQuantity: validation.data.requestedQuantity,
      branch: branch._id,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      status: 'success',
      data: { need },
    });
  } catch (error) {
    return next(error);
  }
};

const getNeeds = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(
      req.query.page,
      req.query.limit,
    );

    const branchId = getBranchId(req, next);

    if (!branchId) {
      return;
    }

    const filter = { branch: branchId };

    if (req.query.status !== undefined) {
      const validStatuses = ['PENDING', 'FULFILLED', 'REJECTED'];

      if (!validStatuses.includes(req.query.status)) {
        return next(new AppError('Invalid need status', 400));
      }

      filter.status = req.query.status;
    }

    const [needs, total] = await Promise.all([
      Need.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('product', 'name barcode')
        .populate('createdBy', 'name email')
        .lean(),
      Need.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: 'success',
      results: needs.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: { needs },
    });
  } catch (error) {
    return next(error);
  }
};

const confirmNeed = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);

    const branchId = getBranchId(req, next);

    if (!branchId) {
      return;
    }

    const need = await Need.findOneAndDelete({
      _id: req.params.id,
      branch: branchId,
    });

    if (!need) {
      return next(new AppError('Need not found in this branch', 404));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Need confirmed and deleted',
      data: { id: need._id },
    });
  } catch (error) {
    return next(error);
  }
};

export { createNeed, getNeeds, confirmNeed };