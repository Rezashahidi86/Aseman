import { ZodError } from 'zod';
import env from '../config/env.js';

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const statusCode = err.statusCode || 500;

  const response = {
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
  };

  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
