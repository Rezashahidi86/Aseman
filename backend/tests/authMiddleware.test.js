import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/roleMiddleware.js';
import AppError from '../utils/AppError.js';
import ROLES from '../constants/roles.js';
import dotenv from 'dotenv';
import env from '../config/env.js';
dotenv.config();

vi.mock('../models/User.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));

describe('Authentication and authorization middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = { headers: {} };
    res = {};
    next = vi.fn();
  });

  it('should reject an invalid token', async () => {
    req.headers.authorization = 'Bearer invalid-token';

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      }),
    );
  });

  it('should reject an expired token', async () => {
    const token = jwt.sign(
      { sub: '507f1f77bcf86cd799439011' },
      env.JWT_SECRET,
      { expiresIn: -1 },
    );

    req.headers.authorization = `Bearer ${token}`;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      }),
    );
  });

  it('should reject a user with an unauthorized role', () => {
    req.user = { role: ROLES.SELLER };

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('should allow an admin', () => {
    req.user = { role: ROLES.ADMIN };

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
