import rateLimit from "express-rate-limit";

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

export default loginRateLimiter;