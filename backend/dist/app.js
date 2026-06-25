"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const err_middleware_1 = require("./middleware/err.middleware");
const healthRouter_1 = __importDefault(require("./routes/healthRouter"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/health", healthRouter_1.default);
app.use("/users", user_routes_1.default);
app.use(err_middleware_1.errorHandler);
exports.default = app;
