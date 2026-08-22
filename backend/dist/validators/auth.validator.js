"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.email({ error: "Invalid email address" }),
    password: zod_1.z.string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters")
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email({ error: "Invalid email address" }),
    password: zod_1.z.string().min(1, "Password is required") // We just need it to exist for login
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z
        .string({ error: "Refresh token is required" })
        .min(1, "Refresh token is required")
});
exports.logoutSchema = zod_1.z.object({
    refreshToken: zod_1.z.string({ error: "Refresh token is required for logout" })
});
