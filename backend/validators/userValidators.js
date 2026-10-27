import { z } from 'zod';

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
    branch: z
      .string()
      .regex(/^[a-f\d]{24}$/i, 'Invalid branch ID'),
  })
  .strict();

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
    role: z.enum(['ADMIN', 'SELLER']).optional(),
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
