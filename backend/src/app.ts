import express from "express";
import { errorHandler } from './middleware/err.middleware';
import healthRouter from './routes/healthRouter'
import userRouter from './routes/user'
import cors from "cors";
import { AppError } from "./utils/AppError";
import { asyncHandler } from "./utils/AsyncHandler";

const app =express();

app.use(cors());
app.use(express.json());


app.use("/health",healthRouter)
app.use("/user",userRouter);


app.get("/user-test", asyncHandler(async(req, res, next) => {
      throw new AppError("Async route failed",500);
}));

app.use(errorHandler);

export default app;