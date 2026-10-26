import mongoose from 'mongoose';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import { saleCartSchema } from '../validators/salesValidators.js';

const prepareSaleItems = async (items, branchId) => {
  const validation = saleCartSchema.safeParse({ items });

  if (!validation.success) {
    throw validation.error;
  }

  if (!mongoose.isValidObjectId(branchId)) {
    throw new AppError('A valid branch is required', 400);
  }

  const productIds = [
    ...new Set(validation.data.items.map((item) => item.productId)),
  ];

  const products = await Product.find({
    _id: { $in: productIds },
    branch: branchId,
  }).lean();

  if (products.length !== productIds.length) {
    throw new AppError(
      'One or more products were not found in the current branch',
      404,
    );
  }

  const productsMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  let totalSales = 0;
  let totalProfit = 0;
  let totalItemsSold = 0;

  const saleItems = validation.data.items.map((item) => {
    const product = productsMap.get(item.productId);

    if (item.finalSalePrice < product.salePrice) {
      throw new AppError(
        `Final sale price for "${product.name}" cannot be lower than the current product sale price`,
        400,
      );
    }

    const lineTotal = item.quantity * item.finalSalePrice;
    const lineProfit =
      item.quantity * (item.finalSalePrice - product.purchasePrice);

    totalSales += lineTotal;
    totalProfit += lineProfit;
    totalItemsSold += item.quantity;

    return {
      product: product._id,
      name: product.name,
      barcode: product.barcode,
      quantity: item.quantity,
      purchasePrice: product.purchasePrice,
      finalSalePrice: item.finalSalePrice,
      lineTotal,
      lineProfit,
    };
  });

  return {
    items: saleItems,
    totalSales,
    totalProfit,
    totalItemsSold,
  };
};

export default prepareSaleItems;