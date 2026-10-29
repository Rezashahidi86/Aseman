import { z } from "zod";

const createBranchSchema = z
  .object({
    name: z.string().trim().min(1, "Branch name is required").max(100),
    code: z
      .string()
      .trim()
      .min(1, "Branch code is required")
      .max(20)
      .transform((value) => value.toUpperCase()),
  })
  .strict();

const updateBranchStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export { createBranchSchema, updateBranchStatusSchema };
