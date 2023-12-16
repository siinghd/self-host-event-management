/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodTypeAny, ZodTypeDef, ZodError } from 'zod';

interface ZodRequestSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = <T extends ZodRequestSchema>(
  schema: ZodSchema<T, ZodTypeDef, any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: e.errors.map((err) => err.message).join(', '),
        });
      }

      // Handle unexpected errors
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
      });
    }
  };
};
