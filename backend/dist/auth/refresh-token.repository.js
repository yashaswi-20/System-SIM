"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const postgres_1 = __importDefault(require("../database/postgres"));
class RefreshTokenRepository {
    async saveToken(userId, tokenHash, expiresAt) {
        await postgres_1.default.query(`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`, [userId, tokenHash, expiresAt]);
    }
    async findToken(tokenHash) {
        const result = await postgres_1.default.query(`SELECT * FROM refresh_tokens WHERE token_hash = $1`, [tokenHash]);
        return result.rows[0] || null;
    }
    async deleteToken(tokenHash) {
        await postgres_1.default.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [tokenHash]);
    }
    async deleteAllUserTokens(userId) {
        await postgres_1.default.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
