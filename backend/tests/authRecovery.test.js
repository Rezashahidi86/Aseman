import crypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import User from '../models/User.js';
import {
  requestPasswordReset,
  resetPassword,
  changeCredentials,
} from '../controllers/authController.js';
import { comparePassword, hashPassword } from '../services/passwordService.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../constants/auth.js';

vi.mock('../models/User.js', () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    updateOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));
vi.mock('../services/passwordService.js', () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));
vi.mock('../services/emailService.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

describe('Password recovery and account credentials', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: {}, user: { _id: '507f1f77bcf86cd799439011' } };
    res = {
      clearCookie: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it('does not reveal whether an email belongs to an account', async () => {
    User.findOne.mockResolvedValue(null);
    req.body = { email: 'missing@example.com' };
    await requestPasswordReset(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('stores only a hash of the reset token and emails the raw token', async () => {
    User.findOne.mockResolvedValue({
      _id: req.user._id,
      email: 'seller@example.com',
    });
    User.updateOne.mockResolvedValue({ matchedCount: 1 });
    req.body = { email: 'seller@example.com' };
    await requestPasswordReset(req, res, next);

    const emailCall = sendPasswordResetEmail.mock.calls[0][0];
    const rawToken = new URL(emailCall.resetUrl).searchParams.get('token');
    const expectedHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const update = User.updateOne.mock.calls[0][1];

    expect(rawToken).toHaveLength(64);
    expect(update.$set.passwordResetTokenHash).toBe(expectedHash);
    expect(update.$set.passwordResetTokenHash).not.toBe(rawToken);
    expect(update.$set.passwordResetExpiresAt.getTime()).toBeGreaterThan(
      Date.now(),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('resets the password once and increments tokenVersion', async () => {
    User.findOneAndUpdate.mockResolvedValue({ _id: req.user._id });
    hashPassword.mockResolvedValue('new-password-hash');
    req.body = {
      token: 'a'.repeat(64),
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
    };
    await resetPassword(req, res, next);

    const [filter, update] = User.findOneAndUpdate.mock.calls[0];
    expect(filter.passwordResetTokenHash).toBe(
      crypto.createHash('sha256').update(req.body.token).digest('hex'),
    );
    expect(filter.passwordResetExpiresAt.$gt).toBeInstanceOf(Date);
    expect(update.$set.passwordHash).toBe('new-password-hash');
    expect(update.$unset.passwordResetTokenHash).toBe(1);
    expect(update.$inc.tokenVersion).toBe(1);
    expect(res.clearCookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      expect.objectContaining({ path: authCookieOptions.path }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('requires the current password and revokes all sessions after credential changes', async () => {
    const user = {
      _id: req.user._id,
      email: 'old@example.com',
      passwordHash: 'old-password-hash',
      tokenVersion: 4,
      isActive: true,
    };
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
    comparePassword.mockResolvedValue(true);
    hashPassword.mockResolvedValue('updated-password-hash');
    User.findOneAndUpdate.mockResolvedValue({ email: 'new@example.com' });
    req.body = {
      currentPassword: 'currentPassword',
      email: 'new@example.com',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    };
    await changeCredentials(req, res, next);

    const [filter, update] = User.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ _id: user._id, tokenVersion: 4 });
    expect(update.$set.email).toBe('new@example.com');
    expect(update.$set.passwordHash).toBeDefined();
    expect(update.$inc.tokenVersion).toBe(1);
    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('updates legacy accounts where tokenVersion is missing', async () => {
    const user = {
      _id: req.user._id,
      email: 'old@example.com',
      passwordHash: 'old-password-hash',
      tokenVersion: 0,
      isActive: true,
    };
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
    comparePassword.mockResolvedValue(true);
    User.findOneAndUpdate.mockResolvedValue({ email: 'new@example.com' });
    req.body = { currentPassword: 'currentPassword', email: 'new@example.com' };
    await changeCredentials(req, res, next);

    const [filter, update] = User.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({
      _id: user._id,
      $or: [{ tokenVersion: 0 }, { tokenVersion: { $exists: false } }],
    });
    expect(update.$inc.tokenVersion).toBe(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.clearCookie).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects credential changes when the current password is incorrect', async () => {
    const user = {
      _id: req.user._id,
      email: 'old@example.com',
      passwordHash: 'old-password-hash',
      tokenVersion: 0,
      isActive: true,
    };
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
    comparePassword.mockResolvedValue(false);
    req.body = { currentPassword: 'wrong-password', email: 'new@example.com' };
    await changeCredentials(req, res, next);
    expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
  });
});
