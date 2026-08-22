import  pool  from "../database/postgres";

export class RefreshTokenRepository {
    async saveToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
            [userId, tokenHash, expiresAt]
        );
    }

    async findToken(tokenHash: string) {
        const result = await pool.query(
            `SELECT * FROM refresh_tokens WHERE token_hash = $1`,
            [tokenHash]
        );
        return result.rows[0] || null;
    }

    async deleteToken(tokenHash: string): Promise<void> {
        await pool.query(
            `DELETE FROM refresh_tokens WHERE token_hash = $1`,
            [tokenHash]
        );
    }

    async deleteAllUserTokens(userId: string): Promise<void> {
        await pool.query(
            `DELETE FROM refresh_tokens WHERE user_id = $1`,
            [userId]
        );
    }
}