import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // req.user is populated by the 'authenticate' middleware that runs before this
        if (!req.user) {
            return next(new AppError("Not authorized", 401));
        }

        // Check if the user's role is in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError("Forbidden: You do not have permission", 403));
        }

        // If they have the right role, let them pass
        next();
    };
};