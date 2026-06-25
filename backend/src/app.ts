import express from "express";
import { errorHandler } from './middleware/err.middleware';
import healthRouter from './routes/healthRouter'
import userRouter from './routes/user.routes'
import redisRouter from './routes/redisRoute'
import cors from "cors";


const app =express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health",healthRouter)
app.use("/user",userRouter);
app.use("/redis-test",redisRouter);



app.get("/user-test", asyncHandler(async(req, res, next) => {
      throw new AppError("Async route failed",500);
}));

app.use(errorHandler);


export default app;
