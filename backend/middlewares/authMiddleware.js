import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import env from '../config/env.js';
import { AUTH_COOKIE_NAME } from '../constants/auth.js';

const authMiddleware = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return next(new AppError('Invalid or expired token', 401));
    }

    return next(error);
  }
};

export default authMiddleware;
