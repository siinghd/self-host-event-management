/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import {
  IGetUserAuthInfoRequest,
  RolesType,
} from '../utils/typesAndInterfaces';
import User from '../models/user.model';
import { CustomError } from '../utils/customError';

import BigPromise from './bigPromise';

export const isLoggedIn = BigPromise(
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    // const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "");

    // check token first in cookies
    // @ts-ignore
    let { accessToken } = req.cookies;

    // if token not found in cookies, check if header contains Auth field
    // Header couldnt be there and the replace will fail...
    // that's why there first line is commented out
    // @ts-ignore
    if (!accessToken && req.header('Authorization')) {
      // @ts-ignore
      accessToken = req.header('Authorization').replace('Bearer ', '');
    }

    if (!accessToken) {
      return next(
        new CustomError(
          'You are not logged in, login first to access the page',
          401
        )
      );
    }

    const decoded: string | JwtPayload = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET as string
    );
    // @ts-ignore
    req.user = await User.findById(decoded.id).select('+tokens');
    if (
      !req.user ||
      accessToken.length === 0 ||
      !req.user.tokens.includes(accessToken)
    ) {
      return res.status(401).json({
        success: false,
        message: 'User not found, it can be due to expired token',
        code: 'USRNF',
      });
    }

    if (!req.user.tokens.includes(accessToken)) {
      new CustomError('invalid token', 401);
    }
    req.accessToken = accessToken;
    req.user.tokens = undefined;
    // req.user = await User.findById('62bb393d103e3eb463bae955');
    // @ts-ignore

    next();
  }
);

// example customRole("admin","staff",5,1);
export const customRole =
  (...roles: RolesType) =>
  (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError('You are not allowed to access this resource', 403)
      );
    }
    next();
  };
// same as above but the custom role will work with multiple roles
// it depends on the preference
// export const isAdmin = bigPromise(async (req, res, next) => {
//   if (req.user.role !== 5) {
//     return next(new CustomError('You are not allowed to access this resource', 403));
//   }
//   next();
// });
