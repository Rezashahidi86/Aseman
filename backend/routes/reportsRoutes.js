import { Router } from 'express';
import {
  getWeeklyReport,
  getMonthlyReport,
  getDailyReport,
  getMonthlyComparison,
  getAllBranches,
  getFilteredReportController,
  getSellerReportController,
} from '../controllers/reportsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';
import requireAdmin from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/all-branches', getAllBranches);
router.get('/:id/daily', setBranchContext, getDailyReport);
router.get('/:id/weekly', setBranchContext, getWeeklyReport);
router.get('/:id/monthly', setBranchContext, getMonthlyReport);
router.get('/:id/monthly-comparison', setBranchContext, getMonthlyComparison);
router.get(
  '/:id/sellers/:sellerId',
  setBranchContext,
  getSellerReportController,
);

router.get('/filtered', getFilteredReportController);

export default router;
