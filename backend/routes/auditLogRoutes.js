import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, requireAdmin);
router.get('/', getAuditLogs);

export default router;
