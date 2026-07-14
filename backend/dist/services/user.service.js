"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const cacheMetrices_1 = require("../cache/cacheMetrices");
const redis_1 = require("../cache/redis");
const user_repository_1 = require("../repositories/user.repository");
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    repository = new user_repository_1.UserRepository();
    async getUsers() {
        return await this.repository.findAll();
    }
    async getUserById(id) {
        const cacheKey = `user:${id}`;
        const cacheData = await redis_1.redisClient.get(cacheKey);
        if (cacheData) {
            cacheMetrices_1.cacheMetrices.incrementHits();
            logger_1.logger.info(`Cache HIT for user ${id}`);
            return JSON.parse(cacheData);
        }
        const user = await this.repository.findById(id);
        if (!user) {
            throw new AppError_1.AppError("User not found", 404);
        }
        if (user) {
            cacheMetrices_1.cacheMetrices.incrementMisses();
            logger_1.logger.info(`Cache MISS for user ${id}`);
            await redis_1.redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 }); // Cache for 1 hour
            return user;
        }
    }
    async createUser(name, email, passwordPlain) {
        const existingUser = await this.repository.findByEmail(email);
        if (existingUser) {
            throw new AppError_1.AppError("Email already Exist", 409);
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(passwordPlain, saltRounds);
        const newUser = await this.repository.create(name, email, passwordHash);
        delete newUser.password; // Remove password before caching and returning
        const cacheKey = `user:${newUser.id}`;
        await redis_1.redisClient.set(cacheKey, JSON.stringify(newUser));
        return newUser;
    }
    async deleteUser(id) {
        await this.repository.delete(id);
        const cacheKey = `user:${id}`;
        await redis_1.redisClient.del(cacheKey);
    }
}
exports.UserService = UserService;
