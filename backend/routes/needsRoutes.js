import { Router } from 'express';
import {
  createNeed,
  getNeeds,
  deleteNeed,
} from '../controllers/needController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';

const router = Router();

router.use(authMiddleware);

router
  .route('/')
  .post(setBranchContext, createNeed)
  .get(setBranchContext, getNeeds);

router.delete('/:id', setBranchContext, deleteNeed);

export default router;