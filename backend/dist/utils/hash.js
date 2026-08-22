"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Creates a fast, secure SHA-256 hash of a token.
 */
const hashToken = (token) => {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
};
exports.hashToken = hashToken;
