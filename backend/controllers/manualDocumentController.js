import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { z } from 'zod';
import ManualDocument from '../models/ManualDocument.js';
import Branch from '../models/Branch.js';
import AppError from '../utils/AppError.js';
import ROLES from '../constants/roles.js';
import pagination from '../utils/pagination.js';
import validateMongoId from '../utils/validateMongoId.js';
import {
  createManualDocumentSchema,
  manualDocumentListSchema,
} from '../validators/manualDocumentValidators.js';
import { createAuditLog } from '../services/auditLogService.js';

const uploadDirectory = path.resolve('uploads/manual-documents');
const imageIndexSchema = z.coerce.number().int().min(0);

const getBranchFilter = (req, next) => {
  if (req.user.role === ROLES.SELLER) {
    if (!req.user.branch) {
      next(new AppError('Seller is not assigned to a branch', 403));
      return null;
    }

    return { branch: req.user.branch };
  }

  const branchId = req.branchId || req.body?.branchId || req.query.branchId;
  if (!branchId || !mongoose.isValidObjectId(branchId)) {
    next(new AppError('A valid branchId is required', 400));
    return null;
  }

  return { branch: branchId };
};

const removeUploadedFiles = async (files = []) => {
  await Promise.all(
    files.map(async (file) => {
      if (file?.path) {
        await fs.unlink(file.path).catch(() => {});
      }
    }),
  );
};

const createManualDocument = async (req, res, next) => {
  let documentCreated = false;

  try {
    const validation = createManualDocumentSchema.safeParse(req.body);

    if (!validation.success) {
      await removeUploadedFiles(req.files);
      return next(validation.error);
    }

    const branchFilter = getBranchFilter(req, next);

    if (!branchFilter) {
      await removeUploadedFiles(req.files);
      return;
    }

    const branch = await Branch.findOne({
      _id: branchFilter.branch,
      isActive: true,
    }).select('_id');

    if (!branch) {
      await removeUploadedFiles(req.files);
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
    documentCreated = true;

    await createAuditLog({
      req,
      action: 'CREATE',
      resource: 'MANUAL_DOCUMENT',
      resourceId: document._id,
      branchId: document.branch,
      after: document,
    });

    return res.status(201).json({
      status: 'success',
      data: {
        document: {
          ...document.toObject(),
          imageUrls: (document.images || []).map(
            (image, index) =>
              `/api/v1/manual-documents/${document._id}/images/${index}?branchId=${document.branch}`,
          ),
        },
      },
    });
  } catch (error) {
    if (!documentCreated) {
      await removeUploadedFiles(req.files);
    }

    return next(error);
  }
};

const getManualDocuments = async (req, res, next) => {
  try {
    const listInput =
      req.method === 'POST' ? { ...req.query, ...req.body } : req.query;
    const validation = manualDocumentListSchema.safeParse(listInput);

    if (!validation.success) {
      return next(validation.error);
    }

    const { page, limit } = validation.data;
    const { skip } = pagination(page, limit);

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

    const documentsWithImageUrls = documents.map((document) => ({
      ...document,
      imageUrls: (document.images || []).map(
        (image, index) =>
          `/api/v1/manual-documents/${document._id}/images/${index}?branchId=${document.branch}`,
      ),
    }));

    return res.status(200).json({
      status: 'success',
      results: documents.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: { documents: documentsWithImageUrls },
    });
  } catch (error) {
    return next(error);
  }
};

const getManualDocumentImage = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);

    const branchFilter = getBranchFilter(req, next);

    if (!branchFilter) {
      return;
    }

    const imageIndexValidation = imageIndexSchema.safeParse(req.params.index);

    if (!imageIndexValidation.success) {
      return next(imageIndexValidation.error);
    }

    const imageIndex = imageIndexValidation.data;

    const document = await ManualDocument.findOne({
      _id: req.params.id,
      ...branchFilter,
    }).select('images');

    if (!document) {
      return next(new AppError('Manual document not found', 404));
    }

    if (imageIndex >= document.images.length) {
      return next(new AppError('Manual document image not found', 404));
    }

    const filename = path.basename(document.images[imageIndex]);
    const imagePath = path.join(uploadDirectory, filename);

    return res.sendFile(imagePath, (error) => {
      if (error) {
        next(error);
      }
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

    const document = await ManualDocument.findOne({
      _id: req.params.id,
      ...branchFilter,
    });

    if (!document) {
      return next(new AppError('Manual document not found', 404));
    }

    await document.deleteOne();

    await createAuditLog({
      req,
      action: 'DELETE',
      resource: 'MANUAL_DOCUMENT',
      resourceId: document._id,
      branchId: document.branch,
      before: document,
    });

    await Promise.all(
      (document.images || []).map(async (image) => {
        const filename = path.basename(image);
        const imagePath = path.join(uploadDirectory, filename);

        await fs.unlink(imagePath).catch(() => {});
      }),
    );

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

export {
  createManualDocument,
  getManualDocuments,
  getManualDocumentImage,
  deleteManualDocument,
};
