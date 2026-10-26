import { Router } from 'express';
import authRouter from './authRoutes.js';
import usersRouter from './usersRoutes.js';
import branchesRouter from './branchesRoutes.js';
import productsRouter from './productsRoutes.js';
import ReferenceCatalog from '../routes/referenceCatalogRoutes.js';
import salesRouter from '../routes/salesRoutes.js';
import reportsRouter from '../routes/reportsRoutes.js'; 
const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/branches', branchesRouter);
router.use('/products', productsRouter);
router.use('/reference-Catalog', ReferenceCatalog);
router.use('/sales', salesRouter);
router.use('/reports', reportsRouter);
export default router;
