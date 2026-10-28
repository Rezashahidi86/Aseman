import { Router } from 'express';
import {
  getBranches,
  getBranchById,
  createBranch,
  selectBranch,
} from '../controllers/branchController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/').get(getBranches).post(requireAdmin, createBranch);
router.post('/select', requireAdmin, selectBranch);
router.get('/:id', getBranchById);

export default router;
