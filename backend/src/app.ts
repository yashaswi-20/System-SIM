import express from "express";
import { errorHandler } from './middleware/err.middleware';
import healthRouter from './routes/healthRouter'
import userRouter from './routes/user.routes'
import { redisClient } from "./cache/redis";
import cors from "cors";


const app =express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/redis-test", async (req, res) => {
    await redisClient.set("test", "hello redis");
    const value = await redisClient.get("test");
    
    res.json({ value });
});

app.use("/health",healthRouter)
app.use("/users", userRouter);

app.use(errorHandler);


export default app;
