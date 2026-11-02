import { z } from 'zod';

const createNeedSchema = z
  .object({
    productId: z.string().regex(/^[a-f\d]{24}$/i),
    requestedQuantity: z.number().int().min(1),
    branchId: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
  })
  .strict();

const updateNeedStatusSchema = z
  .object({
    status: z.enum(['PENDING', 'FULFILLED', 'REJECTED']),
  })
  .strict();

const needQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum(['PENDING', 'FULFILLED', 'REJECTED']).optional(),
    branchId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  })
  .strict();

export { createNeedSchema, updateNeedStatusSchema, needQuerySchema };
