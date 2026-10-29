import { ZodError } from 'zod';
import formatZodError from '../utils/formatZodError.js';
import env from '../config/env.js';

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: formatZodError(err),
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      status: 'fail',
      message: 'A record with these unique fields already exists',
    });
  }

  if (err?.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: 'The provided data is invalid',
    });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid value for a database field',
    });
  }

  if (err?.name === 'MulterError') {
    const isFileTooLarge = err.code === 'LIMIT_FILE_SIZE';
    const isTooManyFiles = err.code === 'LIMIT_FILE_COUNT';

    return res.status(400).json({
      status: 'fail',
      message: isFileTooLarge
        ? 'Uploaded file exceeds the maximum allowed size'
        : isTooManyFiles
          ? 'Too many files were uploaded'
          : 'File upload failed',
    });
  }

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  const isServerError = statusCode >= 500;
  const message =
    isServerError && env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err?.message || 'Internal Server Error';

  const response = {
    status: err?.status || (isServerError ? 'error' : 'fail'),
    message,
  };

  if (env.NODE_ENV === 'development' && err?.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
