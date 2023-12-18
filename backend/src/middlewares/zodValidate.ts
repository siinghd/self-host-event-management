/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import { z, ZodError, ZodTypeAny } from 'zod';

export function createRequestSchema(
  body?: ZodTypeAny,
  query?: ZodTypeAny,
  params?: ZodTypeAny
) {
  return z.object({
    body: body ?? z.object({}).optional(),
    query: query ?? z.object({}).optional(),
    params: params ?? z.object({}).optional(),
  });
}
export const validate = (schema: ReturnType<typeof createRequestSchema>) => {
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
