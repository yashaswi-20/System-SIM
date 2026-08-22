"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postgres_1 = __importDefault(require("../database/postgres"));
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.status(200).json({ "status": "OK" });
});
router.get('/db', async (req, res) => {
    const startedAt = Date.now();
    try {
        await postgres_1.default.query("SELECT 1");
        res.status(200).json({
            status: "OK",
            database: "connected",
            latencyMs: Date.now() - startedAt
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown database error";
        logger_1.logger.error(`Database health check failed: ${message}`);
        res.status(503).json({
            status: "ERROR",
            database: "disconnected"
        });
    }
});
exports.default = router;
