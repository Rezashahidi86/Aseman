import User from '../models/User.js';
import Branch from '../models/Branch.js';
import AppError from '../utils/AppError.js';
import { createUserSchema } from '../validators/userValidators.js';
import { hashPassword } from '../services/passwordService.js';
import ROLES from '../constants/roles.js';
import { updateUserSchema } from '../validators/userValidators.js';

export const createSeller = async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    const branch = await Branch.findById(data.branch);

    if (!branch || !branch.isActive) {
      throw new AppError('Branch not found or inactive', 400);
    }

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw new AppError('Email already exists', 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: ROLES.SELLER,
      branch: branch._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name email role branch isActive createdAt')
      .populate('branch', 'name code')
      .lean();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body);

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (data.branch) {
      const branch = await Branch.findById(data.branch);

      if (!branch || !branch.isActive) {
        throw new AppError('Branch not found or inactive', 400);
      }
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({ email: data.email });

      if (existingUser) {
        throw new AppError('Email already exists', 409);
      }
    }

    if (data.password) {
      data.passwordHash = await hashPassword(data.password);
      delete data.password;
    }

    Object.assign(user, data);
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true },
    ).select('name email role branch isActive');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
