import mongoose from 'mongoose';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';

const decreaseProductStock = async ({ productId, branchId, quantity }) => {
  if (
    !mongoose.isValidObjectId(productId) ||
    !mongoose.isValidObjectId(branchId)
  ) {
    throw new AppError('Invalid product or branch ID', 400);
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError('Quantity must be a positive integer', 400);
  }

  const result = await Product.updateOne(
    {
      _id: productId,
      branch: branchId,
      quantity: { $gte: quantity },
    },
    {
      $inc: { quantity: -quantity },
    },
  );

  if (result.matchedCount === 0) {
    const productExists = await Product.exists({
      _id: productId,
      branch: branchId,
    });

    if (!productExists) {
      throw new AppError(
        'Product not found in the current branch',
        404,
      );
    }

    throw new AppError('Insufficient product stock', 409);
  }

  return result;
};

export { decreaseProductStock };