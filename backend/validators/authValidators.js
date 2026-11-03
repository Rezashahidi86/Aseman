import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .max(254)
  .transform((value) => value.toLowerCase());
const newPasswordSchema = z.string().min(8).max(72);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid email address',
    ),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(256),
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const changeCredentialsSchema = z
  .object({
    currentPassword: z.string().min(1),
    name: z.string().trim().min(2).max(100).optional(),
    email: emailSchema.optional(),
    newPassword: newPasswordSchema.optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((value) => Boolean(value.name || value.email || value.newPassword), {
    message: 'At least one account change is required',
  })
  .refine(
    (value) =>
      !value.newPassword || value.newPassword === value.confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    },
  )
  .refine((value) => !value.confirmPassword || Boolean(value.newPassword), {
    path: ['confirmPassword'],
    message: 'New password is required',
  });
