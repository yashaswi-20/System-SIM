"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
const redisClient = (0, redis_1.createClient)();
exports.redisClient = redisClient;
redisClient.on("error", (err) => {
    logger_1.logger.error("redis client error", err);
});
(async () => {
    try {
        await redisClient.connect();
        logger_1.logger.info("Redis connected Sucessfully..");
    }
    catch (err) {
        logger_1.logger.error("Redis connection failed", err);
    }
})();
