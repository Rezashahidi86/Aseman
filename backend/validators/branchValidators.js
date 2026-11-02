import { z } from 'zod';

const createBranchSchema = z
  .object({
    name: z.string().trim().min(1, 'Branch name is required').max(100),
    code: z
      .string()
      .trim()
      .min(1, 'Branch code is required')
      .max(20)
      .transform((value) => value.toUpperCase()),
  })
  .strict();

const updateBranchStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

const selectBranchSchema = z
  .object({
    branchId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid branch ID'),
  })
  .strict();

export { createBranchSchema, updateBranchStatusSchema, selectBranchSchema };
