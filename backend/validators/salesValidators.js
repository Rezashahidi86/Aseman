import mongoose from 'mongoose';
import { z } from 'zod';

const saleCartItemSchema = z
  .object({
    productId: z
      .string()
      .refine((id) => mongoose.isValidObjectId(id), {
        message: 'Invalid product ID',
      }),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .positive('Quantity must be greater than zero'),
    finalSalePrice: z
      .number()
      .finite('Final sale price must be a finite number')
      .min(0, 'Final sale price cannot be negative'),
  })
  .strict();

const saleCartSchema = z
  .object({
    items: z.array(saleCartItemSchema).min(1, 'Cart must contain at least one item'),
  })
  .strict();

export { saleCartItemSchema, saleCartSchema };