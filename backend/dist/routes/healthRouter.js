"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    logger_1.logger.error("Test error log");
    res.status(200).json({ "status": "OK" });
});
exports.default = router;
