import { Router } from 'express';
import {
  createNeed,
  getNeeds,
  deleteNeed,
} from '../controllers/needController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/').post(createNeed).get(getNeeds);

router.delete('/:id/confirm', deleteNeed);
router.delete('/:id', deleteNeed);

export default router;
