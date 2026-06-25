"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const AppError_1 = require("../utils/AppError");
class UserService {
    repository = new user_repository_1.UserRepository();
    async getUsers() {
        return await this.repository.findAll();
    }
    async getUserById(id) {
        return await this.repository.findById(id);
    }
    async createUser(name, email) {
        const existingUser = await this.repository.findByEmail(email);
        if (existingUser) {
            throw new AppError_1.AppError("Email already Exist", 409);
        }
        return await this.repository.create(name, email);
    }
    async deleteUser(id) {
        return await this.repository.delete(id);
    }
}
exports.UserService = UserService;
