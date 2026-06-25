"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const AppError_1 = require("../utils/AppError");
const AsyncHandler_1 = require("../utils/AsyncHandler");
class UserController {
    service = new user_service_1.UserService();
    getUser = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await this.service.getUsers();
        res.status(200).json({
            success: true,
            data: user
        });
    });
    getUserById = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        const id = req.params.id;
        const user = await this.service.getUserById(id);
        if (!user) {
            throw new AppError_1.AppError("User Not Found", 404);
        }
        res.status(200).json({
            success: true,
            data: user
        });
    });
    createUser = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        const { name, email } = req.body;
        const user = await this.service.createUser(name, email);
        res.status(201).json({
            success: true,
            data: user
        });
    });
    deleteUser = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
        const id = req.params.id;
        await this.service.deleteUser(id);
        res.status(200).json({
            success: true,
        });
    });
}
exports.UserController = UserController;
