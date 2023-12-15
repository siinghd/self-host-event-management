import { validationResult } from 'express-validator';

import BigPromise from './bigPromise';

export const checkFields = BigPromise(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
      error: errors.array()[0].msg,
    });
  }
  next();
});
