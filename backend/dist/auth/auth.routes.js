"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../middleware/validate.middleware"); // Adjust path to your validator middleware
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
// POST /auth/register
router.post("/register", (0, validate_middleware_1.validate)(auth_validator_1.registerSchema), controller.register);
exports.default = router;
