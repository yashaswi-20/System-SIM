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
}
exports.UserRepository = UserRepository;
