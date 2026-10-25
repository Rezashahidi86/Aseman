import { z } from "zod";

const createBranchSchema = z
  .object({
    name: z.string().trim().min(1, "Branch name is required"),
    code: z
      .string()
      .trim()
      .min(1, "Branch code is required")
      .transform((value) => value.toUpperCase()),
  })
  .strict();

export { createBranchSchema };