/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable max-len */
import type { Request, Response, NextFunction } from 'express';

import { CustomError } from '../utils/customError';
import { IGetUserAuthInfoRequest } from '../utils/typesAndInterfaces';

// method can be optimized with more effective error messages
type CustomFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
  ...args: any | undefined
) => void;
// NOTE THIS IS NO LONGER NEED IN EXPRESS 5
// from docs :
// Starting with Express 5,
// route handlers and middleware that return a Promise will call next(value)
// automatically when they reject or throw an error.
export = (func: CustomFunction) =>
  (
    req: Request | IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction,
    ...args: any
  ) =>
    Promise.resolve(func(req, res, next, ...args)).catch((e) => {
      const errorMessage: any[] = [];
      let statusCode = 500;

      if (e.name === 'MongoServerError') {
        if (e.code === 11000) {
          return next(
            new CustomError(
              e.message ||
                `Value already exist in our system, value :${JSON.stringify(
                  e.keyValue
                )}`,
              422
            )
          );
        }
        return next(
          new CustomError(
            e.message ||
              'Something went wrong with our database, we will be back soon',
            statusCode
          )
        );
      }
      if (e.name === 'ValidationError') {
        statusCode = 400;
      }

      if (e.errors) {
        Object.keys(e.errors).forEach((key) => {
          errorMessage.push(`${e.errors[key].message}`);
        });

        return next(
          new CustomError(
            errorMessage.join('|') || 'Internal server error.',
            statusCode
          )
        );
      }
      if (
        e.message === 'invalid token' ||
        e.message === 'jwt malformed' ||
        e.message === 'jwt expired'
      ) {
        return next(new CustomError(e.message, 401));
      }
      next(new CustomError(`Internal server error. ${e.message}`, statusCode));
    });
