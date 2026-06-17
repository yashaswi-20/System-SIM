"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, req, res, next) => {
    console.error(err);
    let statusCode = 500;
    let message = "Internal Server Error";
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message
    });
};
exports.errorHandler = errorHandler;
