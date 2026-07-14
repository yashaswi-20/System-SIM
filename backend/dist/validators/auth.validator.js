"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
        email: zod_1.z.email({ error: "Invalid email address" }),
        password: zod_1.z.string()
            .min(8, "Password must be at least 8 characters")
            .max(64, "Password must not exceed 64 characters")
    })
});
