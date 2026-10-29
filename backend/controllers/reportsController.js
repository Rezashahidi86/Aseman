import {
  getDailyBranchReport,
  getWeeklyBranchReport,
  getMonthlyBranchReport,
  getMonthlyComparisonReport,
  getAllBranchesReport,
  getAllBranchesDailyReport,
  getSellerReport,
  getFilteredReport,
} from '../services/reportsService.js';
import AppError from '../utils/AppError.js';
import {
  getTehranDateKey,
  getTehranMonthKey,
  shiftDateKey,
} from '../utils/dateKeys.js';

const getDailyReport = async (req, res, next) => {
  try {
    if (!req.branchId) {
      return next(new AppError('A valid branch is required', 400));
    }

    const report = await getDailyBranchReport({
      branchId: req.branchId,
      date: req.query.date,
    });

    return res.status(200).json({
      status: 'success',
      data: { report },
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
      month: req.query.month || getTehranMonthKey(),
    });

    return res.status(200).json({
      status: 'success',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
};

const getMonthlyComparison = async (req, res, next) => {
  try {
    if (!req.branchId) {
      return next(new AppError('A valid branch is required', 400));
    }

    const report = await getMonthlyComparisonReport({
      branchId: req.branchId,
    });

    return res.status(200).json({
      status: 'success',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
};

const getAllBranches = async (req, res, next) => {
  try {
    const report = await getAllBranchesReport({ branchId: req.branchId });

    return res.status(200).json({
      status: 'success',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
};

const getAllBranchesDaily = async (req, res, next) => {
  try {
    const today = getTehranDateKey();
    const sixDaysAgo = shiftDateKey(today, -6);

    const report = await getAllBranchesDailyReport({
      startDate: req.query.startDate || sixDaysAgo,
      endDate: req.query.endDate || today,
      branchId: req.branchId,
    });

    return res.status(200).json({
      status: 'success',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
};

const getSellerReportController = async (req, res, next) => {
  try {
    const report = await getSellerReport({
      sellerId: req.params.sellerId,
      branchId: req.params.branchId,
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

const getFilteredReportController = async (req, res, next) => {
  try {
    const report = await getFilteredReport({
      branchId: req.branchId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      groupBy: req.query.groupBy,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    });

    return res.status(200).json({
      status: 'success',
      data: { report },
    });
  } catch (error) {
    return next(error);
  }
};

export {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getMonthlyComparison,
  getAllBranches,
  getAllBranchesDaily,
  getSellerReportController,
  getFilteredReportController,
};
