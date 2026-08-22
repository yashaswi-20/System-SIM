import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../middleware/validate.middleware"; // Adjust path to your validator middleware
import { loginSchema, registerSchema, refreshSchema } from "../validators/auth.validator";
import { authenticate } from "../middleware/auth.middleware";
import { logoutSchema } from "../validators/auth.validator";

const router = Router();
const controller = new AuthController();

// POST /auth/register
router.post("/register", validate(registerSchema), controller.register);

// POST /auth/login
router.post("/login", validate(loginSchema), controller.login);

router.post("/refresh", validate(refreshSchema), controller.refresh);

router.post("/logout", authenticate, validate(logoutSchema), controller.logout);

// POST /auth/logout-all
router.post("/logout-all", authenticate, controller.logoutAll);

export default router;
