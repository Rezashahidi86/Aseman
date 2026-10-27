import mongoose from 'mongoose';
import SalesStats from '../models/SalesStats.js';
import AppError from '../utils/AppError.js';
import {
  dailyReportSchema,
  weeklyReportSchema,
  monthlyReportSchema,
  reportRangeSchema,
  reportFilterSchema,
} from '../validators/reportValidators.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import Sale from '../models/Sale.js';

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

const getMonthlyComparisonReport = async ({ branchId }) => {
  if (!mongoose.isValidObjectId(branchId)) {
    throw new AppError('A valid branch is required', 400);
  }

  const now = new Date();

  const currentMonthDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const previousMonthDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );

  const currentMonth = currentMonthDate.toISOString().slice(0, 7);
  const previousMonth = previousMonthDate.toISOString().slice(0, 7);

  const reports = await SalesStats.find({
    branch: branchId,
    periodType: 'monthly',
    periodKey: { $in: [currentMonth, previousMonth] },
  }).lean();

  const emptyStats = () => ({
    totalSales: 0,
    totalProfit: 0,
    totalItemsSold: 0,
    salesCount: 0,
  });

  const current = reports.find((report) => report.periodKey === currentMonth);

  const previous = reports.find((report) => report.periodKey === previousMonth);

  const currentStats = current
    ? {
        totalSales: current.totalSales,
        totalProfit: current.totalProfit,
        totalItemsSold: current.totalItemsSold,
        salesCount: current.salesCount,
      }
    : emptyStats();

  const previousStats = previous
    ? {
        totalSales: previous.totalSales,
        totalProfit: previous.totalProfit,
        totalItemsSold: previous.totalItemsSold,
        salesCount: previous.salesCount,
      }
    : emptyStats();

  const calculateChange = (currentValue, previousValue) => ({
    difference: currentValue - previousValue,
    percentage:
      previousValue === 0
        ? null
        : Number(
            (((currentValue - previousValue) / previousValue) * 100).toFixed(2),
          ),
  });

  return {
    branch: branchId,
    currentMonth: {
      month: currentMonth,
      ...currentStats,
    },
    previousMonth: {
      month: previousMonth,
      ...previousStats,
    },
    comparison: {
      totalSales: calculateChange(
        currentStats.totalSales,
        previousStats.totalSales,
      ),
      totalProfit: calculateChange(
        currentStats.totalProfit,
        previousStats.totalProfit,
      ),
      totalItemsSold: calculateChange(
        currentStats.totalItemsSold,
        previousStats.totalItemsSold,
      ),
      salesCount: calculateChange(
        currentStats.salesCount,
        previousStats.salesCount,
      ),
    },
  };
};

const getAllBranchesReport = async () => {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);

  const branches = await Branch.find().select('_id name code isActive').lean();

  const stats = await SalesStats.find({
    branch: { $in: branches.map((branch) => branch._id) },
    periodType: 'monthly',
    periodKey: month,
  }).lean();

  const statsByBranch = new Map(
    stats.map((item) => [item.branch.toString(), item]),
  );

  const branchReports = branches.map((branch) => {
    const report = statsByBranch.get(branch._id.toString());

    return {
      branch: {
        id: branch._id,
        name: branch.name,
        code: branch.code,
        isActive: branch.isActive,
      },
      month,
      totalSales: report?.totalSales ?? 0,
      totalProfit: report?.totalProfit ?? 0,
      totalItemsSold: report?.totalItemsSold ?? 0,
      salesCount: report?.salesCount ?? 0,
    };
  });

  const totals = branchReports.reduce(
    (result, report) => ({
      totalSales: result.totalSales + report.totalSales,
      totalProfit: result.totalProfit + report.totalProfit,
      totalItemsSold: result.totalItemsSold + report.totalItemsSold,
      salesCount: result.salesCount + report.salesCount,
    }),
    {
      totalSales: 0,
      totalProfit: 0,
      totalItemsSold: 0,
      salesCount: 0,
    },
  );

  return {
    month,
    branches: branchReports,
    totals,
  };
};

const getAllBranchesDailyReport = async ({ startDate, endDate }) => {
  const validation = reportRangeSchema.safeParse({ startDate, endDate });

  if (!validation.success) {
    throw validation.error;
  }

  const start = new Date(`${validation.data.startDate}T00:00:00.000Z`);
  const end = new Date(`${validation.data.endDate}T23:59:59.999Z`);

  const reports = await Sale.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone: 'UTC',
          },
        },
        totalSales: { $sum: '$totalSales' },
        totalProfit: { $sum: '$totalProfit' },
        totalItemsSold: { $sum: '$totalItemsSold' },
        salesCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    startDate: validation.data.startDate,
    endDate: validation.data.endDate,
    reports: reports.map(({ _id, ...report }) => ({
      date: _id,
      ...report,
    })),
  };
};

const getSellerReport = async ({ sellerId, branchId, startDate, endDate }) => {
  if (
    !mongoose.isValidObjectId(sellerId) ||
    !mongoose.isValidObjectId(branchId)
  ) {
    throw new AppError('A valid seller and branch are required', 400);
  }

  const validation = reportRangeSchema.safeParse({
    startDate,
    endDate,
  });

  if (!validation.success) {
    throw validation.error;
  }

  const seller = await User.findOne({
    _id: sellerId,
    branch: branchId,
    role: 'SELLER',
    isActive: true,
  })
    .select('_id name email branch')
    .lean();

  if (!seller) {
    throw new AppError('Seller not found in this branch', 404);
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);

  const result = await Sale.aggregate([
    {
      $match: {
        branch: new mongoose.Types.ObjectId(branchId),
        createdBy: new mongoose.Types.ObjectId(sellerId),
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalSales' },
        totalProfit: { $sum: '$totalProfit' },
        totalItemsSold: { $sum: '$totalItemsSold' },
        salesCount: { $sum: 1 },
      },
    },
  ]);

  const totals = result[0] || {
    totalSales: 0,
    totalProfit: 0,
    totalItemsSold: 0,
    salesCount: 0,
  };

  return {
    seller: {
      id: seller._id,
      name: seller.name,
      email: seller.email,
    },
    branch: branchId,
    startDate,
    endDate,
    ...totals,
  };
};

const getFilteredReport = async ({
  branchId,
  startDate,
  endDate,
  groupBy = 'day',
  sortBy = 'totalSales',
  sortOrder = 'desc',
}) => {
  const validation = reportFilterSchema.safeParse({
    branchId,
    startDate,
    endDate,
    groupBy,
    sortBy,
    sortOrder,
  });

  if (!validation.success) {
    throw validation.error;
  }

  const filters = validation.data;

  if (!mongoose.isValidObjectId(filters.branchId)) {
    throw new AppError('A valid branch is required', 400);
  }

  const sortFields = {
    totalSales: 'totalSales',
    totalProfit: 'totalProfit',
    totalItemsSold: 'totalItemsSold',
    salesCount: 'salesCount',
  };

  const sortField = sortFields[filters.sortBy];
  const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;

  const pipeline = [
    {
      $match: {
        branch: new mongoose.Types.ObjectId(filters.branchId),
        periodType: 'daily',
        periodKey: {
          $gte: filters.startDate,
          $lte: filters.endDate,
        },
      },
    },
  ];

  if (filters.groupBy === 'month') {
    pipeline.push({
      $addFields: {
        reportPeriod: {
          $substr: ['$periodKey', 0, 7],
        },
      },
    });
  } else {
    pipeline.push({
      $addFields: {
        reportPeriod: '$periodKey',
      },
    });
  }

  pipeline.push(
    {
      $group: {
        _id: '$reportPeriod',
        totalSales: { $sum: '$totalSales' },
        totalProfit: { $sum: '$totalProfit' },
        totalItemsSold: { $sum: '$totalItemsSold' },
        salesCount: { $sum: '$salesCount' },
      },
    },
    {
      $sort: {
        [sortField]: sortDirection,
      },
    },
  );

  const reports = await SalesStats.aggregate(pipeline);

  const totals = reports.reduce(
    (result, report) => ({
      totalSales: result.totalSales + report.totalSales,
      totalProfit: result.totalProfit + report.totalProfit,
      totalItemsSold: result.totalItemsSold + report.totalItemsSold,
      salesCount: result.salesCount + report.salesCount,
    }),
    {
      totalSales: 0,
      totalProfit: 0,
      totalItemsSold: 0,
      salesCount: 0,
    },
  );

  return {
    branch: filters.branchId,
    startDate: filters.startDate,
    endDate: filters.endDate,
    groupBy: filters.groupBy,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    reports: reports.map(({ _id, ...data }) => ({
      period: _id,
      ...data,
    })),
    totals,
  };
};

export {
  getDailyBranchReport,
  getWeeklyBranchReport,
  getMonthlyBranchReport,
  getMonthlyComparisonReport,
  getAllBranchesReport,
  getAllBranchesDailyReport,
  getSellerReport,
  getFilteredReport,
};
