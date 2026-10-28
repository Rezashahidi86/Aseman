import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { loginSchema } from '../validators/authValidators.js';
import { comparePassword } from '../services/passwordService.js';
import env from '../config/env.js';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../constants/auth.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN },
    );

    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -__v');

    if (!user || !user.isActive) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: authCookieOptions.httpOnly,
    secure: authCookieOptions.secure,
    sameSite: authCookieOptions.sameSite,
    path: authCookieOptions.path,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};
