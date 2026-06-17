import pool from "../database/postgres"

import {User} from '../types/user.types'

export class UserRepository {
    async findAll(): Promise<User[]> {
        const result = await pool.query<User>(
            `SELECT * FROM users ORDER BY created_at DESC`
        );
        return result.rows;
    }

    async findById(id :string): Promise<User | null>{
        const result = await pool.query(
            `SELECT * FROM users WHERE id = $1`,[id]
        )
        return result.rows[0] || null
    }

    async create(name:string, email:string) :Promise<User>{
        const result  = await pool.query(
            `INSERT INTO users (name,email) VALUES ($1, $2) RETURNING *`,[name, email]
        )
        return result.rows[0]
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
}
