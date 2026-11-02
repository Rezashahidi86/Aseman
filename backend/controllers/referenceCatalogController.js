import ReferenceCatalog from '../models/ReferenceCatalog.js';
import AppError from '../utils/AppError.js';
import pagination from '../utils/pagination.js';
import validateMongoId from '../utils/validateMongoId.js';
import { createAuditLog } from '../services/auditLogService.js';
import { referenceCatalogQuerySchema } from '../validators/referenceCatalogValidators.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createReferenceCatalog = async (req, res, next) => {
  try {
    const { name, barcode, purchasePrice, salePrice } = req.body;
    const item = await ReferenceCatalog.create({
      name,
      barcode,
      purchasePrice,
      salePrice,
    });

    await createAuditLog({
      req,
      action: 'CREATE',
      resource: 'REFERENCE_CATALOG',
      resourceId: item._id,
      after: item,
    });

    res.status(201).json({
      status: 'success',
      data: {
        item,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern ?? {})[0];

      return next(
        new AppError(
          field === 'name'
            ? 'A reference item with this name already exists'
            : 'A reference item with this barcode already exists',
          409,
        ),
      );
    }

    return next(error);
  }
};

const getReferenceCatalog = async (req, res, next) => {
  try {
    const validation = referenceCatalogQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return next(validation.error);
    }

    const { page, limit, search } = validation.data;
    const { skip } = pagination(page, limit);

    const filter = {};

    if (search) {
      const escapedSearch = escapeRegex(search);

      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { barcode: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      ReferenceCatalog.find(filter)
        .sort({ name: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReferenceCatalog.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      results: items.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateReferenceCatalog = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);
    const { id } = req.params;

    const item = await ReferenceCatalog.findById(id);

    if (!item) {
      return next(new AppError('Reference item not found', 404));
    }

    const before = item.toObject();
    Object.assign(item, req.body);
    await item.save();

    await createAuditLog({
      req,
      action: 'UPDATE',
      resource: 'REFERENCE_CATALOG',
      resourceId: item._id,
      before,
      after: item,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        item,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern ?? {})[0];

      return next(
        new AppError(
          field === 'name'
            ? 'A reference item with this name already exists'
            : 'A reference item with this barcode already exists',
          409,
        ),
      );
    }

    return next(error);
  }
};

const deleteReferenceCatalog = async (req, res, next) => {
  try {
    validateMongoId(req.params.id);
    const item = await ReferenceCatalog.findById(req.params.id);

    if (!item) {
      return next(new AppError('Reference item not found', 404));
    }

    await item.deleteOne();

    await createAuditLog({
      req,
      action: 'DELETE',
      resource: 'REFERENCE_CATALOG',
      resourceId: item._id,
      before: item,
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export {
  createReferenceCatalog,
  getReferenceCatalog,
  updateReferenceCatalog,
  deleteReferenceCatalog,
};
