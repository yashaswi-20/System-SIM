"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf } = winston_1.default.format;
const logformat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});
exports.logger = winston_1.default.createLogger({
    level: "info",
    format: combine(timestamp(), logformat),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({
            filename: "logs/combined.log"
        }),
        new winston_1.default.transports.File({
            filename: "logs/error.log",
            level: "error"
        })
    ]
});
