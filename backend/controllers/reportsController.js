import {
  getDailyBranchReport,
  getWeeklyBranchReport,
  getMonthlyBranchReport,
} from '../services/reportsService.js';
import AppError from '../utils/AppError.js';


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

export { getDailyReport, getWeeklyReport, getMonthlyReport };
