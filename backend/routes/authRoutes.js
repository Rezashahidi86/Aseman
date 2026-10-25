import { Router } from "express";
import {
  login,
  logout,
  getMe,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import loginRateLimiter from "../middlewares/loginRateLimiter.js";

const   router = Router();

router.post("/login", loginRateLimiter, login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);

export default router;