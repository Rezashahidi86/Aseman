import { z } from 'zod';

const createManualDocumentSchema = z
  .object({
    note: z.string().trim().max(2000).default(''),
    documentDetails: z.string().trim().min(1).max(500),
    branchId: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
  })
  .strict();

const manualDocumentListSchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    branchId: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
  })
  .strict();

export { createManualDocumentSchema, manualDocumentListSchema };
