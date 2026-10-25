import { Router } from 'express';
import authRouter from './authRoutes.js';
import usersRouter from './usersRoutes.js';
import branchesRouter from './branchesRoutes.js';
import productsRouter from "./productsRoutes.js";

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/branches', branchesRouter);
router.use("/products", productsRouter);
export default router;
