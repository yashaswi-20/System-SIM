"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postgres_1 = __importDefault(require("../database/postgres"));
const AsyncHandler_1 = require("../utils/AsyncHandler");
const router = (0, express_1.Router)();
router.get("/", (0, AsyncHandler_1.asyncHandler)(async (req, res, next) => {
    const result = await postgres_1.default.query("SELECT NOW()");
    res.status(200).json({ success: true, timestamp: result.rows[0].now });
}));
exports.default = router;
