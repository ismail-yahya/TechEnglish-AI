import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../schemas/auth.schema";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile);
router.put(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  authController.updateProfile,
);

export default router;
