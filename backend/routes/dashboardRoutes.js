import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/summary', setBranchContext, getDashboardSummary);

export default router;
