"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // 1. Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError_1.AppError("Not authorized, no token provided", 401));
    }
    // 2. Extract the token
    const token = authHeader.split(" ")[1];
    try {
        // 3. Verify the token and attach the payload to req.user
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded;
        // 4. Proceed to the next middleware or controller
        next();
    }
    catch (error) {
        // jwt.verify throws an error if the token is expired or altered
        next(new AppError_1.AppError("Not authorized, invalid or expired token", 401));
    }
};
exports.authenticate = authenticate;
