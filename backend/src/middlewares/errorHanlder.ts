import { NextFunction, Request, Response } from 'express';

import logger from '../utils/logger/logger';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  logger.error({
    message: err.message || 'Internal server error.',
    meta: {
      stack: err.stack || '',
      status: err.status || 500,
      method: 'errorHandler',
    },
  });
  return res.status(err.status).json({
    status: err.status,
    success: false,
    message: err.message,
  });
};

export = errorHandler;
