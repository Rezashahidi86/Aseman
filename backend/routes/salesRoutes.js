import { Router } from 'express';
import { createSale } from '../controllers/salesController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.post('/', setBranchContext, createSale);

export default router;  