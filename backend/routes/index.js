import { Router } from 'express';
import authRouter from './authRoutes.js';
import usersRouter from './usersRoutes.js';
import branchesRouter from './branchesRoutes.js';
import productsRouter from './productsRoutes.js';
import ReferenceCatalog from './referenceCatalogRoutes.js';
import salesRouter from './salesRoutes.js';
import reportsRouter from './reportsRoutes.js';
import customersRouter from './customersRoutes.js';
import needsRouter from './needsRoutes.js';
import manualDocumentsRouter from './manualDocumentsRoutes.js';
import auditLogRouter from './auditLogRoutes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/branches', branchesRouter);
router.use('/products', productsRouter);
router.use('/reference-Catalog', ReferenceCatalog);
router.use('/sales', salesRouter);
router.use('/reports', reportsRouter);
router.use('/customers', customersRouter);
router.use('/needs', needsRouter);
router.use('/manual-documents', manualDocumentsRouter);
router.use('/audit-logs', auditLogRouter);
export default router;
