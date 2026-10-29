import ROLES from '../constants/roles.js';
import {
  getDailyBranchReport,
  getMonthlyBranchReport,
  getAllBranchesReport,
  getAllBranchesDailyReport,
} from '../services/reportsService.js';

const getTehranDateKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
};

const getDashboardSummary = async (req, res, next) => {
  try {
    if (req.branchId) {
      const now = new Date();
      const [daily, monthly] = await Promise.all([
        getDailyBranchReport({
          branchId: req.branchId,
          date: now.toISOString().slice(0, 10),
        }),
        getMonthlyBranchReport({
          branchId: req.branchId,
          month: now.toISOString().slice(0, 7),
        }),
      ]);

      return res.status(200).json({
        status: 'success',
        data: {
          dashboard: {
            scope: 'branch',
            branchId: req.branchId,
            daily,
            monthly,
          },
        },
      });
    }

    if (req.user.role !== ROLES.ADMIN) {
      return next();
    }

    const today = getTehranDateKey(new Date());
    const [year, month, day] = today.split('-').map(Number);
    const sixDaysAgo = new Date(Date.UTC(year, month - 1, day - 6))
      .toISOString()
      .slice(0, 10);

    const [monthly, dailyTrend] = await Promise.all([
      getAllBranchesReport(),
      getAllBranchesDailyReport({
        startDate: sixDaysAgo,
        endDate: today,
      }),
    ]);

    const todayReport = dailyTrend.reports.find((report) => report.date === today) || {
      totalSales: 0,
      totalProfit: 0,
      totalItemsSold: 0,
      salesCount: 0,
    };

    return res.status(200).json({
      status: 'success',
      data: {
        dashboard: {
          scope: 'all-branches',
          daily: {
            date: today,
            ...todayReport,
          },
          monthly,
          dailyTrend,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export { getDashboardSummary };
