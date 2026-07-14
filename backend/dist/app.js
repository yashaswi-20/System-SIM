"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const err_middleware_1 = require("./middleware/err.middleware");
const healthRouter_1 = __importDefault(require("./routes/healthRouter"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const redis_1 = require("./cache/redis");
const cors_1 = __importDefault(require("cors"));
const cacheMetrices_1 = require("./cache/cacheMetrices");
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/redis-test", async (req, res) => {
    await redis_1.redisClient.set("test", "hello redis");
    const value = await redis_1.redisClient.get("test");
    res.json({ value });
});
app.use("/health", healthRouter_1.default);
app.use("/auth", auth_routes_1.default);
app.use("/users", user_routes_1.default);
app.get("/cache/stats", (req, res) => {
    res.status(200).json(cacheMetrices_1.cacheMetrices.getMetrics());
});
app.use(err_middleware_1.errorHandler);
exports.default = app;
