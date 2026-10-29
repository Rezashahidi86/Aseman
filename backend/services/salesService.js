import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import SalesStats from '../models/SalesStats.js';
import AppError from '../utils/AppError.js';
import {
  saleCartSchema,
  saleRegistrationSchema,
} from '../validators/salesValidators.js';
import { getTehranDateKey, getTehranMonthKey } from '../utils/dateKeys.js';

const prepareSaleItems = async (items, branchId, session = null) => {
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

  let productsQuery = Product.find({
    _id: { $in: productIds },
    branch: new mongoose.Types.ObjectId(branchId),
  });
  if (session) {
    productsQuery = productsQuery.session(session);
  }
  const products = await productsQuery.lean();
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
        `Final sale price for "${product.name ? product.name : product.barcode}" cannot be lower than the current product sale price`,
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

const registerSale = async ({ items, branchId, sellerId, idempotencyKey }) => {
  const validation = saleRegistrationSchema.safeParse({
    items,
    idempotencyKey,
  });

  if (!validation.success) {
    throw validation.error;
  }

  if (
    !mongoose.isValidObjectId(branchId) ||
    !mongoose.isValidObjectId(sellerId)
  ) {
    throw new AppError('A valid branch and seller are required', 400);
  }

  const normalizedKey = validation.data.idempotencyKey;

  const existingSale = await Sale.findOne({
    idempotencyKey: normalizedKey,
  });

  if (existingSale) {
    if (
      existingSale.branch.toString() !== branchId.toString() ||
      existingSale.createdBy.toString() !== sellerId.toString()
    ) {
      throw new AppError('Idempotency key has already been used', 409);
    }

    return {
      sale: existingSale,
      isDuplicate: true,
    };
  }

  const session = await mongoose.startSession();

  try {
    let createdSale;

    await session.withTransaction(async () => {
      const saleData = await prepareSaleItems(
        validation.data.items,
        branchId,
        session,
      );

      const quantitiesByProduct = new Map();

      for (const item of saleData.items) {
        const productId = item.product.toString();

        quantitiesByProduct.set(
          productId,
          (quantitiesByProduct.get(productId) || 0) + item.quantity,
        );
      }

      for (const [productId, quantity] of quantitiesByProduct) {
        const result = await Product.updateOne(
          {
            _id: productId,
            branch: branchId,
            quantity: { $gte: quantity },
          },
          {
            $inc: {
              quantity: -quantity,
              salesCount: quantity,
            },
          },
          { session },
        );

        if (result.matchedCount === 0) {
          const productExists = await Product.exists({
            _id: productId,
            branch: branchId,
          }).session(session);

          if (!productExists) {
            throw new AppError('Product not found in the current branch', 404);
          }

          throw new AppError('Insufficient product stock', 409);
        }
      }

      const dailyKey = getTehranDateKey();
      const monthlyKey = getTehranMonthKey();

      const statsUpdate = {
        $inc: {
          totalSales: saleData.totalSales,
          totalProfit: saleData.totalProfit,
          totalItemsSold: saleData.totalItemsSold,
          salesCount: 1,
        },
      };

      await SalesStats.updateOne(
        {
          branch: branchId,
          periodType: 'daily',
          periodKey: dailyKey,
        },
        statsUpdate,
        {
          upsert: true,
          session,
          runValidators: true,
        },
      );

      await SalesStats.updateOne(
        {
          branch: branchId,
          periodType: 'monthly',
          periodKey: monthlyKey,
        },
        statsUpdate,
        {
          upsert: true,
          session,
          runValidators: true,
        },
      );

      const [sale] = await Sale.create(
        [
          {
            idempotencyKey: normalizedKey,
            branch: branchId,
            createdBy: sellerId,
            ...saleData,
          },
        ],
        { session },
      );

      createdSale = sale;
    });

    return {
      sale: createdSale,
      isDuplicate: false,
    };
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateSale = await Sale.findOne({
        idempotencyKey: normalizedKey,
      });

      if (duplicateSale) {
        if (
          duplicateSale.branch.toString() !== branchId.toString() ||
          duplicateSale.createdBy.toString() !== sellerId.toString()
        ) {
          throw new AppError('Idempotency key has already been used', 409);
        }

        return {
          sale: duplicateSale,
          isDuplicate: true,
        };
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export { registerSale };
export default prepareSaleItems;
