import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { IGetUserAuthInfoRequest } from '../utils/typesAndInterfaces';
import { UserModel, UserRole } from '../models/user.model';
import { CustomError } from '../utils/customError';

import BigPromise from './bigPromise';

export const isLoggedIn = BigPromise(
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const accessToken =
      req.cookies.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return next(
        new CustomError(
          'You are not logged in, login first to access the page',
          401
        )
      );
    }

    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET || ''
      ) as jwt.JwtPayload;
      const user = await UserModel.findById(decoded.id).select('+tokens');

      if (!user || !user.tokens?.includes(accessToken)) {
        return res.status(401).json({
          success: false,
          message: 'User not found, it can be due to expired token',
          code: 'USRNF',
        });
      }

      req.user = user;
      req.accessToken = accessToken;
      next();
    } catch (err) {
      return next(new CustomError('Invalid token or token expired', 401));
    }
  }
);

export const customRole = (...roles: UserRole[]) => {
  return (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    if (req.user) {
      if (roles.includes(req.user.role)) {
        return next();
      }
    }
    return next(
      new CustomError('You are not allowed to access this resource', 403)
    );
  };
};
