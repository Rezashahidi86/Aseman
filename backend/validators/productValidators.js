import { z } from 'zod';

const createProductSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name is required'),
    barcode: z.string().trim().min(1, 'Barcode is required'),
    purchasePrice: z.number().finite().min(0),
    salePrice: z.number().finite().min(0),
    quantity: z.number().int().min(0),
    minimumStock: z.number().int().min(0).optional(),
    branchId: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
  })
  .strict();

const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    barcode: z.string().trim().min(1).optional(),
    purchasePrice: z.number().finite().min(0).optional(),
    salePrice: z.number().finite().min(0).optional(),
    minimumStock: z.number().int().min(0).optional(),
    quantity: z.number().int().min(0).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export { createProductSchema, updateProductSchema };
