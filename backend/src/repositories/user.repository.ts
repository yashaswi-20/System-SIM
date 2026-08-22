import pool from "../database/postgres"

import {User} from '../types/user.types'

export class UserRepository {
    async findAll(): Promise<User[]> {
        const result = await pool.query<User>(
            `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
        );
        return result.rows;
    }

    async findById(id :string): Promise<User | null>{
        const result = await pool.query(
            `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,[id]
        )
        return result.rows[0] || null
    }

    async create(name: string, email: string, passwordHash: string, role: string = "USER"): Promise<User> {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, email, passwordHash, role]
        );
        return result.rows[0];
    }
    async delete(id:string) :Promise<User>{
        const result = await pool.query(
            `DELETE FROM users WHERE id=$1 RETURNING *`,[id]
        )
        return result.rows[0]
    }
    async findByEmail(email:string) : Promise<User |null> {
        const result = await pool.query(
            `SELECT * FROM users WHERE email=$1`, [email]
        )
        return result.rows[0] || null;
    }

    async storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
            [userId, tokenHash, expiresAt]
        );
    }
}
