"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
const redisClient = (0, redis_1.createClient)();
redisClient.on("error", (err) => {
    logger_1.logger.error("redis client error", err);
});
