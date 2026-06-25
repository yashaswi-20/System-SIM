import { redisClient } from "../cache/redis";
import { logger } from "../utils/logger";

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const raw = await redisClient.get(key);
    if (raw === null) {
      logger.info(`Cache MISS: ${key}`);
      return null;
    }
    logger.info(`Cache HIT: ${key}`);
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const str = JSON.stringify(value);
    if (ttl) {
      await redisClient.set(key, str, { EX: ttl });
    } else {
      await redisClient.set(key, str);
    }
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await redisClient.exists(key)) === 1;
  }
}

export const cacheService = new CacheService();