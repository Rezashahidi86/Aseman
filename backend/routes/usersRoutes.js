import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  updateUser,
  deactivateUser,
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, requireAdmin);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').patch(updateUser);
router.patch('/:id/deactivate', deactivateUser);

export default router;
