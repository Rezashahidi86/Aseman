import { z } from 'zod';
import ROLES from '../constants/roles.js';

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),

    email: z
      .string()
      .trim()
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Invalid email address',
      ),

    password: z.string().min(8, 'Password must be at least 8 characters'),

    role: z.enum([ROLES.ADMIN, ROLES.SELLER]),

    branch: z
      .string()
      .regex(/^[a-f\d]{24}$/i, 'Invalid branch ID')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === ROLES.SELLER && !data.branch) {
      ctx.addIssue({
        code: 'custom',
        path: ['branch'],
        message: 'Branch is required for sellers',
      });
    }

    if (data.role === ROLES.ADMIN && data.branch) {
      ctx.addIssue({
        code: 'custom',
        path: ['branch'],
        message: 'Admins cannot be assigned to a branch',
      });
    }
  });

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z
      .string()
      .trim()
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Invalid email address',
      )
      .optional(),
    password: z.string().min(8).optional(),
    role: z.enum([ROLES.ADMIN, ROLES.SELLER]).optional(),
    branch: z
      .string()
      .regex(/^[a-f\d]{24}$/i, 'Invalid branch ID')
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
