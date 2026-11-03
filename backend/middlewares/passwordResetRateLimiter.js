import rateLimit from 'express-rate-limit';

const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'fail',
    message:
      'Too many password recovery attempts. Please try again in 15 minutes.',
  },
});

export default passwordResetRateLimiter;
