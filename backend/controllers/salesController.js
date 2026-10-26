import { registerSale } from '../services/salesService.js';
import AppError from '../utils/AppError.js';
import {
  getDailyBranchReport,
  getWeeklyBranchReport,
  getMonthlyBranchReport,
} from '../services/reportsService.js';

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

    const sale = result.sale;

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
      data: {
        receipt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getWeeklyReport = async (req, res, next) => {
  try {
    if (!req.branchId) {
      return next(new AppError('A valid branch is required', 400));
    }

    const report = await getWeeklyBranchReport({
      branchId: req.branchId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    return res.status(200).json({
      status: 'success',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    if (!req.branchId) {
      return next(new AppError('A valid branch is required', 400));
    }

    const report = await getMonthlyBranchReport({
      branchId: req.branchId,
      month: req.query.month,
    });

    return res.status(200).json({
      status: 'success',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
};

export { createSale, getWeeklyReport, getMonthlyReport };
