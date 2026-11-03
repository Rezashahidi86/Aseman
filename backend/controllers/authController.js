import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, changeCredentialsSchema } from '../validators/authValidators.js';
import { comparePassword, hashPassword } from '../services/passwordService.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import env from '../config/env.js';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../constants/auth.js';

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: authCookieOptions.httpOnly,
    secure: authCookieOptions.secure,
    sameSite: authCookieOptions.sameSite,
    path: authCookieOptions.path,
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.isActive) throw new AppError('Invalid email or password', 401);
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) throw new AppError('Invalid email or password', 401);

    const token = jwt.sign({
      sub: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    return res.status(200).json({ status: 'success', message: 'Logged in successfully' });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -tokenVersion -__v');
    if (!user || !user.isActive) throw new AppError('User not found', 404);
    return res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    clearAuthCookie(res);
    return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    return next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email, isActive: true });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await User.updateOne({ _id: user._id, isActive: true }, {
        $set: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt },
      });

      const resetUrl = new URL('/reset-password', env.FRONTEND_URL);
      resetUrl.searchParams.set('token', rawToken);
      await sendPasswordResetEmail({ email: user.email, resetUrl: resetUrl.toString() });
    }

    return res.status(200).json({
      status: 'success',
      message: 'If an active account exists for this email, a recovery link has been sent.',
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const passwordHash = await hashPassword(password);

    const user = await User.findOneAndUpdate({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
      isActive: true,
    }, {
      $set: { passwordHash },
      $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
      $inc: { tokenVersion: 1 },
    }, { new: true, projection: { _id: 1 } });

    if (!user) throw new AppError('Password reset link is invalid or expired', 400);
    clearAuthCookie(res);
    return res.status(200).json({
      status: 'success',
      message: 'Password has been reset. Please sign in again.',
    });
  } catch (error) {
    return next(error);
  }
};

export const changeCredentials = async (req, res, next) => {
  try {
    const { currentPassword, email, newPassword } = changeCredentialsSchema.parse(req.body);
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user || !user.isActive) throw new AppError('User not found', 404);

    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) throw new AppError('Current password is incorrect', 401);

    const updates = {};
    if (email && email !== user.email) updates.email = email;
    if (newPassword) updates.passwordHash = await hashPassword(newPassword);
    if (!Object.keys(updates).length) throw new AppError('No account changes were provided', 400);

    const updatedUser = await User.findOneAndUpdate({
      _id: user._id,
      tokenVersion: user.tokenVersion,
    }, {
      $set: updates,
      $inc: { tokenVersion: 1 },
      $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
    }, { new: true, projection: { email: 1 } });

    if (!updatedUser) throw new AppError('Account changed during this request. Please try again.', 409);
    clearAuthCookie(res);
    return res.status(200).json({
      status: 'success',
      message: 'Account information updated. Please sign in again.',
      data: { email: updatedUser.email },
    });
  } catch (error) {
    return next(error);
  }
};
