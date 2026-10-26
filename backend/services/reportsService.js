import mongoose from 'mongoose';
import SalesStats from '../models/SalesStats.js';
import AppError from '../utils/AppError.js';
import {
  dailyReportSchema,
  weeklyReportSchema,
  monthlyReportSchema,
} from '../validators/reportValidators.js';

const getDailyBranchReport = async ({ branchId, date }) => {
  if (!branchId) {
    throw new AppError('A valid branch is required', 400);
  }

  const validation = dailyReportSchema.safeParse({ date });

  if (!validation.success) {
    throw validation.error;
  }

  const reportDate =
    validation.data.date || new Date().toISOString().slice(0, 10);

  const report = await SalesStats.findOne({
    branch: branchId,
    periodType: 'daily',
    periodKey: reportDate,
  }).lean();

  return {
    branch: branchId,
    date: reportDate,
    totalSales: report?.totalSales ?? 0,
    totalProfit: report?.totalProfit ?? 0,
    totalItemsSold: report?.totalItemsSold ?? 0,
    salesCount: report?.salesCount ?? 0,
  };
};

const getWeeklyBranchReport = async ({ branchId, startDate, endDate }) => {
  if (!branchId) {
    throw new AppError('A valid branch is required', 400);
  }

  const validation = weeklyReportSchema.safeParse({ startDate, endDate });

  if (!validation.success) {
    throw validation.error;
  }

  const report = await SalesStats.aggregate([
    {
      $match: {
        branch: new mongoose.Types.ObjectId(branchId),
        periodType: 'daily',
        periodKey: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalSales' },
        totalProfit: { $sum: '$totalProfit' },
        totalItemsSold: { $sum: '$totalItemsSold' },
        salesCount: { $sum: '$salesCount' },
      },
    },
  ]);

  const totals = report[0] || {
    totalSales: 0,
    totalProfit: 0,
    totalItemsSold: 0,
    salesCount: 0,
  };

  return {
    branch: branchId,
    startDate,
    endDate,
    ...totals,
  };
};

const getMonthlyBranchReport = async ({ branchId, month }) => {
  if (!branchId) {
    throw new AppError('A valid branch is required', 400);
  }

  const validation = monthlyReportSchema.safeParse({ month });

  if (!validation.success) {
    throw validation.error;
  }

  const report = await SalesStats.findOne({
    branch: branchId,
    periodType: 'monthly',
    periodKey: month,
  }).lean();

  return {
    branch: branchId,
    month,
    totalSales: report?.totalSales ?? 0,
    totalProfit: report?.totalProfit ?? 0,
    totalItemsSold: report?.totalItemsSold ?? 0,
    salesCount: report?.salesCount ?? 0,
  };
};

export { getDailyBranchReport, getWeeklyBranchReport, getMonthlyBranchReport };
