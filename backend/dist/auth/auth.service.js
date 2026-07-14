"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const password_1 = require("../utils/password");
const user_repository_1 = require("../repositories/user.repository");
const AppError_1 = require("../utils/AppError");
class AuthService {
    repository = new user_repository_1.UserRepository();
    async register(name, email, passwordPlain) {
        // 1. Check for duplicates
        const existingUser = await this.repository.findByEmail(email);
        if (existingUser) {
            throw new AppError_1.AppError("Email already exists", 409);
        }
        // 2. Hash the password
        const passwordHash = await (0, password_1.hashPassword)(passwordPlain);
        // 3. Save to database
        const newUser = await this.repository.create(name, email, passwordHash);
        // 4. Strip the password before returning
        delete newUser.password;
        return newUser;
    }
}
exports.AuthService = AuthService;
