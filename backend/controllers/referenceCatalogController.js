import ReferenceCatalog from '../models/ReferenceCatalog.js';
import AppError from '../utils/AppError.js';
import pagination from '../utils/pagination.js';
import validateMongoId from '../utils/validateMongoId.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createReferenceCatalog = async (req, res, next) => {
  try {
    const { name, purchasePrice, salePrice } = req.body;
    const barcode = req.body.barcode;
    const item = await ReferenceCatalog.create({
      name,
      barcode,
      purchasePrice,
      salePrice,
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
    const { page, limit, skip } = pagination(req.query.page, req.query.limit);
    const search = req.query.search?.trim();

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

    const item = await ReferenceCatalog.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return next(new AppError('Reference item not found', 404));
    }

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
    const item = await ReferenceCatalog.findByIdAndDelete(req.params.id);

    if (!item) {
      return next(new AppError('Reference item not found', 404));
    }

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
