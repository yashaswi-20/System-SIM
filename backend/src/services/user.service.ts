import { cacheMetrices } from "../cache/cacheMetrices";
import { redisClient } from "../cache/redis";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export class UserService {
  private repository = new UserRepository();

  async getUsers() {
    return await this.repository.findAll();
  }

  async getUserById(id: string) {
    const cacheKey = `user:${id}`;
    const cacheData = await redisClient.get(cacheKey);
    if (cacheData) {
    cacheMetrices.incrementHits();
      logger.info(`Cache HIT for user ${id}`);
      return JSON.parse(cacheData);
    }

    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (user) {
      cacheMetrices.incrementMisses();
      logger.info(`Cache MISS for user ${id}`);
      await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 }); // Cache for 1 hour
      return user;
    }
  }

  async createUser(name: string, email: string) {
    const existingUser = await this.repository.findByEmail(email);

    if (existingUser) {
      throw new AppError("Email already Exist", 409);
    }
    const newUser = await this.repository.create(name, email);
    const cacheKey = `user:${newUser.id}`;
    await redisClient.set(cacheKey, JSON.stringify(newUser));
    return newUser;
  }

  async deleteUser(id: string) {
    await this.repository.delete(id);
    const cacheKey = `user:${id}`;
    await redisClient.del(cacheKey);
  }
}
