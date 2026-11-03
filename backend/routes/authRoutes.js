import { Router } from 'express';
import {
  login,
  logout,
  getMe,
  requestPasswordReset,
  resetPassword,
  changeCredentials,
} from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import loginRateLimiter from '../middlewares/loginRateLimiter.js';
import passwordResetRateLimiter from '../middlewares/passwordResetRateLimiter.js';

const router = Router();

router.post('/login', loginRateLimiter, login);
router.post('/password/forgot', passwordResetRateLimiter, requestPasswordReset);
router.post('/password/reset', passwordResetRateLimiter, resetPassword);
router.patch('/credentials', authMiddleware, changeCredentials);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

export default router;
