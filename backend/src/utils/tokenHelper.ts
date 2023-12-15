  /* eslint-disable eslint-comments/disable-enable-pair */
  /* eslint-disable no-param-reassign */
  import { Response } from 'express';
  import jwt from 'jsonwebtoken';

  const cookieToken = async (user: any, res: Response) => {
    try {
      const accessToken = user.getJwtAccessToken();
      const refreshToken = user.getJwtRefreshToken();
      user.tokens.push(accessToken, refreshToken);
      await user.save();
      user.password = undefined;
      user.tokens = undefined;
      const options = {
        expires: new Date(
          Date.now() +
            364 *
              parseInt(process.env.COOKIE_TIME as string, 10) *
              24 *
              60 *
              60 *
              1000
        ),
        httpOnly: true,
      };

    res.status(200).cookie('accessToken', accessToken, options).json({
      success: true,
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error in creating jwt token',
      code: 'JWTERR',
    });
  }
};

  const veryfyJwtToken = (token: string) => {
    try {
      return {
        isValid: true,
        // this can be syng as there are no performance diff in async and sync
        // https://github.com/auth0/node-jsonwebtoken/issues/566
        decoded: jwt.verify(token, process.env.JWT_ACCESS_SECRET as string),
      };
    } catch (err) {
      return {
        isValid: false,
        err,
      };
    }
  };

  export { cookieToken, veryfyJwtToken };
