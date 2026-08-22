"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const AppError_1 = require("../utils/AppError");
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user is populated by the 'authenticate' middleware that runs before this
        if (!req.user) {
            return next(new AppError_1.AppError("Not authorized", 401));
        }
        // Check if the user's role is in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError_1.AppError("Forbidden: You do not have permission", 403));
        }
        // If they have the right role, let them pass
        next();
    };
};
exports.authorize = authorize;
