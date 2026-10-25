import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import AppError from '../utils/AppError.js';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/productValidators.js';
import ROLES from '../constants/roles.js';
import pagination from '../utils/pagination.js';
import sortAllowlist from '../utils/sortAllowlist.js';
import fieldSelection from '../utils/fieldSelection.js';
import validateMongoId from '../utils/validateMongoId.js';

const handleProductDuplicateKey = (error, next) => {
  if (error.code !== 11000) {
    return next(error);
  }

  if (error.keyPattern?.barcode) {
    return next(new AppError('Barcode already exists in this branch', 409));
  }

  return next(
    new AppError('Product conflicts with an existing record in this branch', 409),
  );
};

const createProduct = async (req, res, next) => {
  try {
    const validation = createProductSchema.safeParse(req.body);

    if (!validation.success) {
      return next(new AppError('Invalid product data', 400));
    }

    const { branchId: _branchId, ...productData } = validation.data;
    const branchId = req.branchId;

    if (!branchId || !mongoose.isValidObjectId(branchId)) {
      return next(new AppError('A valid branch is required', 400));
    }

    const branch = await Branch.findOne({
      _id: branchId,
      isActive: true,
    });

    if (!branch) {
      return next(new AppError('Branch not found or inactive', 404));
    }

    const product = await Product.create({
      ...productData,
      branch: branch._id,
    });

    return res.status(201).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    return handleProductDuplicateKey(error, next);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { name, barcode, page, limit, sort, fields, branchId } =
      req.query;

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = pagination(page, limit);

    const allowedSortFields = [
      'name',
      'barcode',
      'purchasePrice',
      'salePrice',
      'quantity',
      'salesCount',
      'createdAt',
    ];

    const allowedFields = [
      'name',
      'barcode',
      'purchasePrice',
      'salePrice',
      'quantity',
      'salesCount',
      'branch',
      'createdAt',
      'updatedAt',
      'minimumStock',
    ];

    const sortOption = sort
      ? sortAllowlist(sort, allowedSortFields)
      : { createdAt: -1 };

    const selectedFields = fieldSelection(fields, allowedFields);
    const projection = selectedFields || '-__v';

    const filter = {};

    if (req.user.role === ROLES.SELLER) {
      if (!req.user.branch) {
        return next(
          new AppError('Seller is not assigned to a branch', 403),
        );
      }

      filter.branch = req.user.branch;
    } else if (req.user.role === ROLES.ADMIN) {
      if (branchId !== undefined) {
        if (
          typeof branchId !== 'string' ||
          !/^[a-f\d]{24}$/i.test(branchId)
        ) {
          return next(new AppError('Invalid branchId', 400));
        }

        filter.branch = branchId;
      }
    }

    if (name !== undefined) {
      if (
        typeof name !== 'string' ||
        !name.trim() ||
        name.trim().length > 100
      ) {
        return next(new AppError('Invalid product name filter', 400));
      }

      const escapedName = name
        .trim()
        .replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\.replace(/[.*+?^${}()|[]\\]/g, '\\$&');');

      filter.name = {
        $regex: escapedName,
        $options: 'i',
      };
    }

    if (barcode !== undefined) {
      if (
        typeof barcode !== 'string' ||
        !barcode.trim() ||
        barcode.trim().length > 100
      ) {
        return next(new AppError('Invalid barcode filter', 400));
      }

      if (!filter.branch) {
        return next(new AppError('A branch must be selected', 400));
      }

      filter.barcode = barcode.trim();
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(currentLimit)
        .select(projection)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
      data: {
        products,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateMongoId(id);
    const filter = { _id: id };

    if (req.user.role === ROLES.SELLER) {
      if (!req.user.branch) {
        return next(new AppError('Seller is not assigned to a branch', 403));
      }

      filter.branch = req.user.branch;
    } else if (req.query.branchId !== undefined) {
      if (!mongoose.isValidObjectId(req.query.branchId)) {
        return next(new AppError('Invalid branch ID', 400));
      }

      filter.branch = req.query.branchId;
    }

    const product = await Product.findOne(filter).select('-__v').lean();

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);

    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return next(new AppError('Invalid product data', 400));
    }

    const filter = { _id: req.params.id };

    if (req.user.role === ROLES.SELLER) {
      if (!req.user.branch) {
        return next(new AppError('Seller is not assigned to a branch', 403));
      }

      filter.branch = req.user.branch;
    } else if (req.query.branchId) {
      if (!mongoose.isValidObjectId(req.query.branchId)) {
        return next(new AppError('Invalid branch ID', 400));
      }

      filter.branch = req.query.branchId;
    }

    const product = await Product.findOne(filter);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    Object.assign(product, validation.data);
    await product.save();

    return res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    return handleProductDuplicateKey(error, next);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError('Invalid product ID', 400));
    }

    const filter = { _id: req.params.id };

    if (req.user.role === ROLES.SELLER) {
      if (!req.user.branch) {
        return next(new AppError('Seller is not assigned to a branch', 403));
      }

      filter.branch = req.user.branch;
    } else if (req.query.branchId) {
      if (!mongoose.isValidObjectId(req.query.branchId)) {
        return next(new AppError('Invalid branch ID', 400));
      }

      filter.branch = req.query.branchId;
    }

    const product = await Product.findOne(filter);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.salesCount > 0) {
      return next(
        new AppError('Product has sales history and cannot be deleted', 409),
      );
    }

    await product.deleteOne();

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
