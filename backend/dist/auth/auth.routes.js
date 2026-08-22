"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../middleware/validate.middleware"); // Adjust path to your validator middleware
const auth_validator_1 = require("../validators/auth.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_validator_2 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
// POST /auth/register
router.post("/register", (0, validate_middleware_1.validate)(auth_validator_1.registerSchema), controller.register);
// POST /auth/login
router.post("/login", (0, validate_middleware_1.validate)(auth_validator_1.loginSchema), controller.login);
router.post("/refresh", (0, validate_middleware_1.validate)(auth_validator_1.refreshSchema), controller.refresh);
router.post("/logout", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(auth_validator_2.logoutSchema), controller.logout);
// POST /auth/logout-all
router.post("/logout-all", auth_middleware_1.authenticate, controller.logoutAll);
exports.default = router;
