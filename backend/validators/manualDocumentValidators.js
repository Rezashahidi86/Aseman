import { z } from 'zod';

const createManualDocumentSchema = z
  .object({
    note: z.string().trim().max(2000).default(''),
    documentDetails: z.string().trim().min(1).max(500),
  })
  .strict();

export { createManualDocumentSchema };