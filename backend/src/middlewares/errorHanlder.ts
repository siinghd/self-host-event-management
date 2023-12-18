import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger/logger';

interface AppError extends Error {
  status?: number;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const status = err.status || 500;

  logger.error({
    message: err.message || 'Internal server error.',
    meta: {
      stack: err.stack || '',
      status: status,
      method: req.method,
      url: req.url,
    },
  });

  if (process.env.NODE_ENV === 'production') {
    return res.status(status).json({
      status: status,
      success: false,
      message: 'An error occurred.',
    });
  } else {
    return res.status(status).json({
      status: status,
      success: false,
      message: err.message || 'Internal server error.',
    });
  }
};

export = errorHandler;
