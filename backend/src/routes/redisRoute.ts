import { Router } from "express";
import { redisClient } from "../cache/redis";
import { asyncHandler } from "../utils/AsyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    // ping() returns the string "PONG" when Redis is reachable.
    // If Redis is down, this throws and asyncHandler forwards it to the error middleware.
    await redisClient.ping();
    res.status(200).json({ success: true, message: "Redis connected" });
  }),
);

export default router;
