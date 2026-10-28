import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Branch from '../models/Branch.js';
import AppError from '../utils/AppError.js';
import ROLES from '../constants/roles.js';
import pagination from '../utils/pagination.js';
import sortAllowlist from '../utils/sortAllowlist.js';
import fieldSelection from '../utils/fieldSelection.js';
import validateMongoId from '../utils/validateMongoId.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../validators/customerValidators.js';

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCustomerBranchFilter = (req, next) => {
  if (req.user.role === ROLES.SELLER) {
    const branchId = req.branchId || req.user.branch;

    if (!branchId) {
      next(new AppError('Seller is not assigned to a branch', 403));
      return null;
    }

    return { branch: branchId };
  }

  const branchId = req.branchId || req.query?.branchId;

  if (!branchId || !mongoose.isValidObjectId(branchId)) {
    next(new AppError('A valid branchId is required', 400));
    return null;
  }

  return { branch: branchId };
};

const createCustomer = async (req, res, next) => {
  try {
    const validation = createCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      return next(validation.error);
    }

    const branchFilter = getCustomerBranchFilter(req, next);

    if (!branchFilter) {
      return;
    }

    const branch = await Branch.findOne({
      _id: branchFilter.branch,
      isActive: true,
    }).select('_id');

    if (!branch) {
      return next(new AppError('Branch not found or inactive', 404));
    }

    const customer = await Customer.create({
      ...validation.data,
      branch: branch._id,
    });

    return res.status(201).json({
      status: 'success',
      data: { customer },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new AppError('A customer with this phone already exists in this branch', 409),
      );
    }

    return next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const { search, name, phone, page, limit, sort, fields } = req.query;

    const { page: currentPage, limit: currentLimit, skip } =
      pagination(page, limit);

    const allowedSortFields = ['name', 'phone', 'createdAt'];
    const allowedFields = [
      'name',
      'phone',
      'branch',
      'createdAt',
      'updatedAt',
    ];

    const sortOption = sort
      ? sortAllowlist(sort, allowedSortFields)
      : { createdAt: -1, _id: -1 };

    const selectedFields = fieldSelection(fields, allowedFields);
    const projection = selectedFields || '-__v';

    const filter = getCustomerBranchFilter(req, next);

    if (!filter) {
      return;
    }

    if (search !== undefined) {
      if (
        typeof search !== 'string' ||
        !search.trim() ||
        search.trim().length > 100
      ) {
        return next(new AppError('Invalid search value', 400));
      }

      const escapedSearch = escapeRegex(search.trim());

      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { phone: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (name !== undefined) {
      if (
        typeof name !== 'string' ||
        !name.trim() ||
        name.trim().length > 100
      ) {
        return next(new AppError('Invalid name filter', 400));
      }

      filter.name = {
        $regex: escapeRegex(name.trim()),
        $options: 'i',
      };
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || !/^09\d{9}$/.test(phone.trim())) {
        return next(new AppError('Invalid phone filter', 400));
      }

      filter.phone = phone.trim();
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(currentLimit)
        .select(projection)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: 'success',
      results: customers.length,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
      data: { customers },
    });
  } catch (error) {
    return next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);

    const validation = updateCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      return next(validation.error);
    }

    const filter = getCustomerBranchFilter(req, next);

    if (!filter) {
      return;
    }

    filter._id = req.params.id;

    const customer = await Customer.findOne(filter);

    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    Object.assign(customer, validation.data);
    await customer.save();

    return res.status(200).json({
      status: 'success',
      data: { customer },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new AppError('A customer with this phone already exists in this branch', 409),
      );
    }

    return next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);

    const filter = getCustomerBranchFilter(req, next);

    if (!filter) {
      return;
    }

    filter._id = req.params.id;

    const customer = await Customer.findOneAndDelete(filter);

    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
};