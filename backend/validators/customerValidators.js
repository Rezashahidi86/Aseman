import { z } from 'zod';

const createCustomerSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    phone: z
      .string()
      .trim()
      .regex(/^09\d{9}$/, 'Invalid phone number'),
    message: z.string().trim().max(1000).optional(),
  })
  .strict();

const updateCustomerSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^09\d{9}$/, 'Invalid phone number')
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

const customerQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(100).optional(),
    name: z.string().trim().min(1).max(100).optional(),
    phone: z.string().trim().regex(/^09\d{9}$/).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sort: z.string().max(200).optional(),
    fields: z.string().max(300).optional(),
    branchId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  })
  .strict();

export { createCustomerSchema, updateCustomerSchema, customerQuerySchema };
