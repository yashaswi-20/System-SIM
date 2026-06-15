import { Router } from "express";
import { logger } from "../utils/logger";

const router =Router();

router.get('/',(req,res)=>{
    logger.error("Test error log");
    res.status(200).json({"status":"OK"})
})

export default router;