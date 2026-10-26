import { Router } from 'express';
import {
  getWeeklyReport,
  getMonthlyReport,
  getDailyReport,
} from '../controllers/reportsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';
import requireAdmin from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/:id/daily', setBranchContext, getDailyReport);
router.get('/:id/weekly', setBranchContext, getWeeklyReport);
router.get('/:id/monthly', setBranchContext, getMonthlyReport);

export default router;
