"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const password_1 = require("../utils/password");
const user_repository_1 = require("../repositories/user.repository");
const AppError_1 = require("../utils/AppError");
const refresh_token_repository_1 = require("./refresh-token.repository");
const jwt_1 = require("../utils/jwt");
const hash_1 = require("../utils/hash");
const jwt_2 = require("../utils/jwt");
class AuthService {
    repository = new user_repository_1.UserRepository();
    refreshTokenRepo = new refresh_token_repository_1.RefreshTokenRepository();
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
    async login(email, passwordPlain) {
        // 1. Find user by email
        const user = await this.repository.findByEmail(email);
        // 2. If user doesn't exist, throw generic 401
        if (!user) {
            throw new AppError_1.AppError("Invalid credentials", 401);
        }
        // 3. Compare passwords
        // The user object from the DB contains the hashed password
        const isPasswordValid = await (0, password_1.comparePassword)(passwordPlain, user.password);
        if (!isPasswordValid) {
            throw new AppError_1.AppError("Invalid credentials", 401);
        }
        // 1. Generate both tokens
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        // 2. Hash the refresh token
        const hashedRefreshToken = (0, hash_1.hashToken)(refreshToken);
        // 3. Calculate expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        // 4. Save the HASH to PostgreSQL
        await this.refreshTokenRepo.saveToken(user.id, hashedRefreshToken, expiresAt);
        delete user.password;
        // 5. Return BOTH tokens to the client
        return { user, accessToken, refreshToken };
    }
    async refresh(refreshTokenPlain) {
        // 1. Hash incoming token to check the database
        const incomingHash = (0, hash_1.hashToken)(refreshTokenPlain);
        // 2. Look up the hash in the database
        const existingToken = await this.refreshTokenRepo.findToken(incomingHash);
        if (!existingToken) {
            throw new AppError_1.AppError("Invalid or expired refresh token", 401);
        }
        // 3. Verify the JWT signature and expiration
        let payload;
        try {
            payload = (0, jwt_2.verifyRefreshToken)(refreshTokenPlain);
        }
        catch (error) {
            // If the token is cryptographically invalid or expired, delete the useless hash from the DB
            await this.refreshTokenRepo.deleteToken(incomingHash);
            throw new AppError_1.AppError("Invalid or expired refresh token", 401);
        }
        // 4. Generate NEW tokens
        const newPayload = { id: payload.id, email: payload.email, role: payload.role };
        const newAccessToken = (0, jwt_1.generateAccessToken)(newPayload);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(newPayload);
        // 5. Hash the NEW refresh token
        const newHash = (0, hash_1.hashToken)(newRefreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        // 6. ROTATION: Delete the old hash and save the new one
        await this.refreshTokenRepo.deleteToken(incomingHash);
        await this.refreshTokenRepo.saveToken(payload.id, newHash, expiresAt);
        // 7. Return the fresh tokens
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }
    // Inside AuthService
    async logout(refreshTokenPlain) {
        if (!refreshTokenPlain)
            return;
        // Hash the token to find its match in the database
        const tokenHash = (0, hash_1.hashToken)(refreshTokenPlain);
        // Delete it. If it doesn't exist, that's fine (they are already logged out)
        await this.refreshTokenRepo.deleteToken(tokenHash);
    }
    // Inside AuthService
    async logoutAll(userId) {
        // This instantly invalidates every single refresh token tied to this user
        await this.refreshTokenRepo.deleteAllUserTokens(userId);
    }
}
exports.AuthService = AuthService;
