"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const postgres_1 = __importDefault(require("../database/postgres"));
class UserRepository {
    async findAll() {
        const result = await postgres_1.default.query(`SELECT * FROM users ORDER BY created_at DESC`);
        return result.rows;
    }
    async findById(id) {
        const result = await postgres_1.default.query(`SELECT * FROM users WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }
    async create(name, email) {
        const result = await postgres_1.default.query(`INSERT INTO users (name,email) VALUES ($1, $2) RETURNING *`, [name, email]);
        return result.rows[0];
    }
    async delete(id) {
        const result = await postgres_1.default.query(`DELETE FROM users WHERE id=$1 RETURNING *`, [id]);
        return result.rows[0];
    }
    async findByEmail(email) {
        const result = await postgres_1.default.query(`SELECT * FROM users WHERE email=$1`, [email]);
        return result.rows[0] || null;
    }
}
exports.UserRepository = UserRepository;
