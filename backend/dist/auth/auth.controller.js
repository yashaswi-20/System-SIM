"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const AsyncHandler_1 = require("../utils/AsyncHandler");
class AuthController {
    service = new auth_service_1.AuthService();
    register = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        const { name, email, password } = req.body;
        const user = await this.service.register(name, email, password);
        res.status(201).json({
            success: true,
            user: user
        });
    });
}
exports.AuthController = AuthController;
