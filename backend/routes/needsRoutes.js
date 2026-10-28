import { Router } from 'express';
import {
  createNeed,
  getNeeds,
  confirmNeed,
} from '../controllers/needController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';

const router = Router();

router.use(authMiddleware);

router
  .route('/')
  .post(setBranchContext, createNeed)
  .get(setBranchContext, getNeeds);

router.post('/:id/confirm', setBranchContext, confirmNeed);

export default router;