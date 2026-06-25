import { createClient } from "redis";
import { logger } from "../utils/logger";

// 1. CREATE the client (this does NOT connect — it just configures it).
//    Compare to postgres.ts: `new Pool({ connectionString })`.
//    The redis client reads the URL from REDIS_URL (loaded by dotenv in server.ts).
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// 2. WIRE UP event listeners. The client emits events over its lifetime;
//    this is where our Winston logs come from (Task 6: "Redis connected / disconnected").
//    Note: 'error' MUST have a listener — otherwise an unhandled error event
//    crashes the whole Node process.
redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.error(`Redis error: ${err.message}`);
});

redisClient.on("end", () => {
  logger.warn("Redis disconnected");
});

// 3. CONNECT helper. The v4 client does NOT auto-connect (unlike pg's pool),
//    so we must explicitly await connect(). We call this from server.ts at startup.
export const connectRedis = async (): Promise<void> => {
  // isOpen guards against connecting twice (e.g. on hot-reload with ts-node-dev).
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
