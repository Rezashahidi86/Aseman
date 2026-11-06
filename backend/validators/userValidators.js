import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid email address',
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'SELLER']).default('SELLER'),
  branch: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid branch ID').nullable().optional(),
}).superRefine((data, context) => {
  if (data.role === 'SELLER' && !data.branch) {
    context.addIssue({ code: 'custom', path: ['branch'], message: 'A branch is required for sellers' });
  }
  if (data.role === 'ADMIN' && data.branch) {
    context.addIssue({ code: 'custom', path: ['branch'], message: 'Administrators cannot be assigned to a branch' });
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
