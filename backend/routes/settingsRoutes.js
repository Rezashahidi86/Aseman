import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/roleMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = Router();
router.use(authMiddleware, requireAdmin);
router.route('/').get(getSettings).patch(updateSettings);
export default router;
