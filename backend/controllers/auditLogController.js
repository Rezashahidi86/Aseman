import mongoose from 'mongoose';
import AuditLog, {
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
} from '../models/AuditLog.js';
import AppError from '../utils/AppError.js';

const getAuditLogs = async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 25);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return next(new AppError('Invalid pagination parameters', 400));
    }

    const filter = {};

    if (req.query.action !== undefined) {
      if (!AUDIT_ACTIONS.includes(req.query.action)) {
        return next(new AppError('Invalid audit action', 400));
      }

      filter.action = req.query.action;
    }

    if (req.query.resource !== undefined) {
      if (!AUDIT_RESOURCES.includes(req.query.resource)) {
        return next(new AppError('Invalid audit resource', 400));
      }

      filter.resource = req.query.resource;
    }

    for (const field of ['actor', 'branch', 'resourceId']) {
      if (req.query[field] !== undefined) {
        if (!mongoose.isValidObjectId(req.query[field])) {
          return next(new AppError(`Invalid ${field}`, 400));
        }

        filter[field] = req.query[field];
      }
    }

    if (req.query.from !== undefined || req.query.to !== undefined) {
      const createdAt = {};

      if (req.query.from !== undefined) {
        const from = new Date(req.query.from);

        if (Number.isNaN(from.getTime())) {
          return next(new AppError('Invalid from date', 400));
        }

        createdAt.$gte = from;
      }

      if (req.query.to !== undefined) {
        const to = new Date(req.query.to);

        if (Number.isNaN(to.getTime())) {
          return next(new AppError('Invalid to date', 400));
        }

        createdAt.$lte = to;
      }

      filter.createdAt = createdAt;
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name role')
        .populate('branch', 'name code')
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: 'success',
      results: logs.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: { logs },
    });
  } catch (error) {
    return next(error);
  }
};

export { getAuditLogs };
