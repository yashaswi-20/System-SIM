import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../middleware/validate.middleware"; // Adjust path to your validator middleware
import { registerSchema } from "../validators/auth.validator";

const router = Router();
const controller = new AuthController();

// POST /auth/register
router.post("/register", validate(registerSchema), controller.login);

export default router;