import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // 1. Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Not authorized, no token provided", 401));
    }

    // 2. Extract the token
    const token = authHeader.split(" ")[1];

    try {
        // 3. Verify the token and attach the payload to req.user
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        
        // 4. Proceed to the next middleware or controller
        next();
    } catch (error) {
        // jwt.verify throws an error if the token is expired or altered
        next(new AppError("Not authorized, invalid or expired token", 401));
    }
};