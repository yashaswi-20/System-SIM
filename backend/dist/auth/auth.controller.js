"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const AppError_1 = require("../utils/AppError");
class AuthController {
    service = new auth_service_1.AuthService();
    register = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        const { name, email, password } = req.body;
        const user = await this.service.register(name, email, password);
        res.status(201).json({
            success: true,
            user
        });
    });
    login = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await this.service.login(email, password);
        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user
        });
    });
    refresh = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new AppError_1.AppError("Refresh token is required", 400);
        }
        const tokens = await this.service.refresh(refreshToken);
        res.status(200).json({
            success: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    });
    logout = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        const { refreshToken } = req.body;
        await this.service.logout(refreshToken);
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    });
    logoutAll = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        // req.user is guaranteed to exist here because of the authenticate middleware
        const userId = req.user.id;
        await this.service.logoutAll(userId);
        res.status(200).json({
            success: true,
            message: "Successfully logged out from all devices"
        });
    });
}
exports.AuthController = AuthController;
