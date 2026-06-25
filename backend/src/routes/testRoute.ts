import { Router } from "express";
import { logger } from "../utils/logger";
import pool from "../database/postgres";
import { asyncHandler } from "../utils/AsyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({success: true, timestamp: result.rows[0].now });
  }),

  

);



export default router;
