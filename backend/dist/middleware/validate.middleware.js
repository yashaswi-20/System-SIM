"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Validates and replaces req.body with the cleaned/parsed data
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    errors: error.issues.map(err => ({
                        path: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    };
};
exports.validate = validate;
