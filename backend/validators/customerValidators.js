import { z } from 'zod';

const createCustomerSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    phone: z.string().trim().regex(/^09\d{9}$/, 'Invalid phone number'),
  })
  .strict();

const updateCustomerSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    phone: z.string().trim().regex(/^09\d{9}$/, 'Invalid phone number').optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export { createCustomerSchema, updateCustomerSchema };