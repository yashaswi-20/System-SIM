import { Router } from "express";
import pool from "../database/postgres";
import { logger } from "../utils/logger";

const router =Router();

router.get('/',(req,res)=>{
    res.status(200).json({"status":"OK"})
})

router.get('/db', async (req, res) => {
    const startedAt = Date.now();

    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "OK",
            database: "connected",
            latencyMs: Date.now() - startedAt
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown database error";
        logger.error(`Database health check failed: ${message}`);

        res.status(503).json({
            status: "ERROR",
            database: "disconnected"
        });
    }
});

export default router;
