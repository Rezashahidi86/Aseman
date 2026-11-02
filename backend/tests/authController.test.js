import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logout } from '../controllers/authController.js';
import User from '../models/User.js';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../constants/auth.js';

vi.mock('../models/User.js', () => ({
  default: {
    updateOne: vi.fn(),
  },
}));

describe('Authentication controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: {
        _id: '507f1f77bcf86cd799439011',
      },
    };
    res = {
      clearCookie: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it('increments the token version and clears the authentication cookie on logout', async () => {
    User.updateOne.mockResolvedValue({ matchedCount: 1 });

    await logout(req, res, next);

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: req.user._id },
      { $inc: { tokenVersion: 1 } },
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      expect.objectContaining({
        httpOnly: authCookieOptions.httpOnly,
        secure: authCookieOptions.secure,
        sameSite: authCookieOptions.sameSite,
        path: authCookieOptions.path,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('does not report successful logout when token revocation fails', async () => {
    User.updateOne.mockRejectedValue(new Error('Database unavailable'));

    await logout(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Database unavailable' }),
    );
    expect(res.clearCookie).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
