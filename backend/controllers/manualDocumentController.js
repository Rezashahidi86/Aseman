import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import ManualDocument from '../models/ManualDocument.js';
import Branch from '../models/Branch.js';
import AppError from '../utils/AppError.js';
import ROLES from '../constants/roles.js';
import pagination from '../utils/pagination.js';
import validateMongoId from '../utils/validateMongoId.js';
import { createManualDocumentSchema } from '../validators/manualDocumentValidators.js';

const uploadDirectory = path.resolve('uploads/manual-documents');

const getBranchFilter = (req, next) => {
  if (req.user.role === ROLES.SELLER) {
    if (!req.user.branch) {
      next(new AppError('Seller is not assigned to a branch', 403));
      return null;
    }

    return { branch: req.user.branch };
  }

  const branchId = req.query.branchId || req.body.branchId;

  if (!branchId || !mongoose.isValidObjectId(branchId)) {
    next(new AppError('A valid branchId is required', 400));
    return null;
  }

  return { branch: branchId };
};

const removeUploadedFile = async (file) => {
  if (file?.path) {
    await fs.unlink(file.path).catch(() => {});
  }
};

const createManualDocument = async (req, res, next) => {
  try {
    const validation = createManualDocumentSchema.safeParse(req.body);

    if (!validation.success) {
      await removeUploadedFile(req.file);
      return next(validation.error);
    }

    if (!req.files || req.files.length === 0) {
      return next(new AppError('Document image is required', 400));
    }

    const branchFilter = getBranchFilter(req, next);

    if (!branchFilter) {
      await removeUploadedFile(req.file);
      return;
    }

    const branch = await Branch.findOne({
      _id: branchFilter.branch,
      isActive: true,
    }).select('_id');

    if (!branch) {
      await removeUploadedFile(req.file);
      return next(new AppError('Branch not found or inactive', 404));
    }

    const document = await ManualDocument.create({
      ...validation.data,
      images: req.files.map(
        (file) => `/uploads/manual-documents/${file.filename}`,
      ),
      branch: branch._id,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      status: 'success',
      data: { document },
    });
  } catch (error) {
    await removeUploadedFile(req.file);
    return next(error);
  }
};

const getManualDocuments = async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query.page, req.query.limit);

    const branchFilter = getBranchFilter(req, next);

    if (!branchFilter) {
      return;
    }

    const filter = { ...branchFilter };

    const [documents, total] = await Promise.all([
      ManualDocument.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .populate('createdBy', 'name email')
        .lean(),
      ManualDocument.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: 'success',
      results: documents.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: { documents },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteManualDocument = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);

    const branchFilter = getBranchFilter(req, next);

    if (!branchFilter) {
      return;
    }

    const document = await ManualDocument.findOneAndDelete({
      _id: req.params.id,
      ...branchFilter,
    });

    if (!document) {
      return next(new AppError('Manual document not found', 404));
    }

    await Promise.all(
      document.images.map(async (image) => {
        const filename = path.basename(image);
        const imagePath = path.join(uploadDirectory, filename);

        await fs.unlink(imagePath).catch(() => {});
      }),
    );

    return res.status(204).json({
      status: 'success',
      message: 'Manual document deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export { createManualDocument, getManualDocuments, deleteManualDocument };
