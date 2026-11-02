import { z } from 'zod';
import AppError from './AppError.js';

const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

const validateMongoId = (id) => {
  if (!mongoIdSchema.safeParse(id).success) {
    throw new AppError('Invalid MongoDB ID', 400);
  }

  return id;
};

export default validateMongoId;
