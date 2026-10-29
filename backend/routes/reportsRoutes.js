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

router.get('/:id/daily', setBranchContext, getDailyReport);
router.get('/:id/weekly', setBranchContext, getWeeklyReport);
router.get('/:id/monthly', setBranchContext, getMonthlyReport);
router.get('/:id/monthly-comparison', setBranchContext, getMonthlyComparison);

router.get(
  '/:id/sellers/:sellerId',
  requireAdmin,
  setBranchContext,
  getSellerReportController,
);

router.get('/filtered', requireAdmin, getFilteredReportController);

export default router;
