import { z } from 'zod';

const createNeedSchema = z
  .object({
    productId: z.string().regex(/^[a-f\d]{24}$/i),
    requestedQuantity: z.number().int().min(1),
  })
  .strict();

const updateNeedStatusSchema = z
  .object({
    status: z.enum(['PENDING', 'FULFILLED', 'REJECTED']),
  })
  .strict();

export { createNeedSchema, updateNeedStatusSchema };