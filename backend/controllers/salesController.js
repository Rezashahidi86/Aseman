import { registerSale } from '../services/salesService.js';
import AppError from '../utils/AppError.js';

const createSale = async (req, res, next) => {
  try {
    const idempotencyKey = req.get('Idempotency-Key');

    if (!idempotencyKey) {
      return next(
        new AppError('Idempotency-Key header is required', 400),
      );
    }

    if (!req.branchId) {
      return next(new AppError('A valid branch is required', 400));
    }

    const result = await registerSale({
      items: req.body.items,
      branchId: req.branchId,
      sellerId: req.user._id,
      idempotencyKey,
    });

    return res.status(result.isDuplicate ? 200 : 201).json({
      status: 'success',
      isDuplicate: result.isDuplicate,
      data: {
        sale: result.sale,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export { createSale };