import { Router } from 'express';
import {
  getWeeklyReport,
  getMonthlyReport,
  getDailyReport,
  getMonthlyComparison,
  getAllBranches,
  getAllBranchesDaily,
  getFilteredReportController,
  getSellerReportController,
} from '../controllers/reportsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';
import requireAdmin from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/all-branches/daily', requireAdmin, getAllBranchesDaily);
router.get('/all-branches', requireAdmin, getAllBranches);

router.get('/:branchId/daily', setBranchContext, getDailyReport);
router.get('/:branchId/weekly', setBranchContext, getWeeklyReport);
router.get('/:branchId/monthly', setBranchContext, getMonthlyReport);
router.get('/:branchId/monthly-comparison', setBranchContext, getMonthlyComparison);

router.get(
  '/:branchId/sellers/:sellerId',
  requireAdmin,
  setBranchContext,
  getSellerReportController,
);

router.get('/filtered', setBranchContext, getFilteredReportController);

export default router;
