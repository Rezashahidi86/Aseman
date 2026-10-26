import { ZodError } from 'zod';

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

  return res.status(statusCode).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
    stack: err.stack,
  });
};

export default errorMiddleware;
