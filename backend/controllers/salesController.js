import { registerSale } from '../services/salesService.js';
import AppError from '../utils/AppError.js';

const createSale = async (req, res, next) => {
  try {
    const idempotencyKey = req.get('Idempotency-Key');

    if (!idempotencyKey) {
      return next(new AppError('Idempotency-Key header is required', 400));
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

    const { sale } = result;
    const receipt = {
      receiptNumber: sale._id.toString().slice(-8).toUpperCase(),
      saleId: sale._id,
      branch: sale.branch,
      createdAt: sale.createdAt,
      items: sale.items.map((item) => ({
        name: item.name,
        barcode: item.barcode,
        quantity: item.quantity,
        unitPrice: item.finalSalePrice,
        lineTotal: item.lineTotal,
      })),
      totalItemsSold: sale.totalItemsSold,
      totalSales: sale.totalSales,
      totalProfit: sale.totalProfit,
    };

    return res.status(result.isDuplicate ? 200 : 201).json({
      status: 'success',
      isDuplicate: result.isDuplicate,
      data: { receipt },
    });
  } catch (error) {
    return next(error);
  }
};

export { createSale };
