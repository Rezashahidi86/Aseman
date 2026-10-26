import { z } from 'zod';

const createReferenceCatalogSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Product name is required')
      .max(150, 'Product name cannot exceed 150 characters'),
    barcode: z.string().trim().min(1, 'Barcode is required').optional(),
    purchasePrice: z
      .number()
      .finite('Purchase price must be a finite number')
      .min(0, 'Purchase price cannot be negative'),
    salePrice: z
      .number()
      .finite('Sale price must be a finite number')
      .min(0, 'Sale price cannot be negative'),
  })
  .strict();

const updateReferenceCatalogSchema = createReferenceCatalogSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export { createReferenceCatalogSchema, updateReferenceCatalogSchema };
