import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validates and replaces req.body with the cleaned/parsed data
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
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