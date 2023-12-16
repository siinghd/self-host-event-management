/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/customError';
import { IGetUserAuthInfoRequest } from '../utils/typesAndInterfaces';

type CustomFunction = (
  req: Request | IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction,
  ...args: unknown[]
) => Promise<Response<any, Record<string, any>> | void>;

const ERROR_MESSAGES: Record<string, string> = {
  MongoServerError:
    'Something went wrong with our database, we will be back soon',
  ValidationError: 'Invalid input data.',
  AuthError: 'Authentication error.',
  Default: 'Internal server error.',
};

const STATUS_CODES: Record<string, number> = {
  MongoServerError: 422,
  ValidationError: 400,
  AuthError: 401,
  Default: 500,
};

export = (func: CustomFunction) =>
  async (
    req: Request | IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction,
    ...args: unknown[]
  ): Promise<void> => {
    try {
      await func(req, res, next, ...args);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        return next(new CustomError('Unknown error', STATUS_CODES.Default));
      }

      let statusCode = STATUS_CODES.Default;
      const errorMessage: string[] = [];

      if (error.name === 'MongoServerError') {
        statusCode = STATUS_CODES.MongoServerError;
        const mongoError = error as any; // Specific typing can be added if known
        if (mongoError.code === 11000) {
          return next(
            new CustomError(
              `Value already exists: ${JSON.stringify(mongoError.keyValue)}`,
              statusCode
            )
          );
        }
      } else if (error.name === 'ValidationError') {
        statusCode = STATUS_CODES.ValidationError;
      }

      if ('errors' in error) {
        const validationError = error as any; // Specific typing can be added if known
        Object.keys(validationError.errors).forEach((key) => {
          if (Object.hasOwnProperty.call(validationError.errors, key)) {
            errorMessage.push(validationError.errors[key].message);
          }
        });
      }

      const message =
        errorMessage.length > 0
          ? errorMessage.join('|')
          : error.message ||
            ERROR_MESSAGES[error.name] ||
            ERROR_MESSAGES.Default;

      next(new CustomError(message, statusCode));
    }
  };
