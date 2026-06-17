"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const err_middleware_1 = require("./middleware/err.middleware");
const healthRouter_1 = __importDefault(require("./routes/healthRouter"));
const user_1 = __importDefault(require("./routes/user"));
const cors_1 = __importDefault(require("cors"));
const AppError_1 = require("./utils/AppError");
const AsyncHandler_1 = require("./utils/AsyncHandler");
const testRoute_1 = __importDefault(require("./routes/testRoute"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/health", healthRouter_1.default);
app.use("/user", user_1.default);
app.use("/db-test", testRoute_1.default);
app.get("/user-test", (0, AsyncHandler_1.asyncHandler)(async (req, res, next) => {
    throw new AppError_1.AppError("Async route failed", 500);
}));
app.use(err_middleware_1.errorHandler);
exports.default = app;
