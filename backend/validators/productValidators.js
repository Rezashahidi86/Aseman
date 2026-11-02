import { z } from 'zod';

const optionalBarcode = z.preprocess(
  (value) => (typeof value === 'string' && !value.trim() ? undefined : value),
  z.string().trim().min(1, 'Barcode cannot be empty').optional(),
);

const createProductSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name is required'),
    barcode: optionalBarcode,
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
    barcode: optionalBarcode,
    purchasePrice: z.number().finite().min(0).optional(),
    salePrice: z.number().finite().min(0).optional(),
    minimumStock: z.number().int().min(0).optional(),
    quantity: z.number().int().min(0).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

const productQuerySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    barcode: z.string().trim().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sort: z.string().max(200).optional(),
    fields: z.string().max(300).optional(),
    branchId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    stock: z.enum(['low', 'available']).optional(),
  })
  .strict();

export { createProductSchema, updateProductSchema, productQuerySchema };
