import rateLimit from 'express-rate-limit';

const smsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => req.user._id.toString(),
  skip: (req) => !req.body?.message,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many SMS requests. Please try again in 15 minutes.',
  },
});

export default smsRateLimiter;
