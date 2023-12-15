/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-duplicate-disable */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable consistent-return */
// @ts-nocheck
// note this is not cool to see :()

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { IGetUserAuthInfoRequest } from 'src/utils/typesAndInterfaces';
import { NextFunction, Response } from 'express';
import User from '../models/user.model';
import BigPromise from '../middlewares/bigPromise';
import { cookieToken, veryfyJwtToken } from '../utils/tokenHelper';
import { WhereClauseUser } from '../utils/whereClause/WhereClauseUser';
import { CustomError } from '../utils/customError';
import { EmailService } from '../utils/email/emailService';
import { RESTRICTED_UPDATE_USER_PROPERTIES_BASED_ON_ROLE } from '../utils/constants';
import { createHtmlTemplate } from '../utils/methods';
import { createNotification } from '../utils/dbHelpers/notification';

const emailService = new EmailService();

// User Authentication Methods

const removeExpiredTokens = async (user: any) => {
  const validTokens = user.tokens.filter((token) => {
    try {
      const decoded = jwt.decode(token);
      const expiry = decoded.exp * 1000;
      const now = new Date().getTime();
      return expiry > now;
    } catch (err) {
      return false;
    }
  });

  user.tokens = validTokens;
  await user.save();
};

export const signup = BigPromise(async (req, res, next) => {
  const { name, email, password, surname, phoneNumber } = req.body;

  if (!email || !name || !password) {
    return next(new CustomError('Name, email and password are required', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    surname,
    fullName: `${name} ${surname}`,
    phoneNumber,
    isActive: true,
  });

  cookieToken(user, res);
});

export const login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  // check for presence of email and password
  if (!email || !password) {
    return next(new CustomError('Please provide email and password', 400));
  }

  // get user from DB
  const user = await User.findOne({
    email: email.toLowerCase(),
    isActive: true,
  }).select('+password +tokens');

  // if user not found in DB
  if (!user) {
    return next(
      new CustomError(
        'Email or password does not match, exist or User is not been activated',
        400
      )
    );
  }

  // match the password
  const isPasswordCorrect = await user.isValidatedPassword(password);

  // if password do not match, same ad above
  if (!isPasswordCorrect) {
    return next(
      new CustomError('Email or password does not match or exist', 400)
    );
  }
  // Remove expired tokens
  await removeExpiredTokens(user);
  // if all goes good and we send the token
  cookieToken(user, res);
});

// User Management Methods
export const inviteUser = BigPromise(async (req, res, next) => {
  const { name, surname, email, phoneNumber, role } = req.body;

  const existingUser = await User.findOne({ email });
  // check for presence of email and password
  if (existingUser) {
    return next(new CustomError('User with this email already exists.', 400));
  }
  // Generate a unique invitation token
  const invitationToken = uuidv4();
  const invitationObj = {
    name,
    surname,
    fullName: `${name} ${surname}`,
    email,
    invitationToken,
    phoneNumber,
    password: process.env.INVITE_USER_PASSWORD,
    geoArea,
    role: role.toLowerCase(),
  };

  const user = await User.create(invitationObj);
  if (!user) {
    return next(new CustomError('User invitation failed', 400));
  }
  // const inviteLink = `${req.protocol}://${req.get(
  //   'host'
  // )}/invitation/${invitationToken}`;
  const inviteLink = `${req.get('origin')}/invitation/${invitationToken}`;
  const emailContent = `You've been invited to join the Honpe Portal! To complete your registration and access all the features, click on the link: ${inviteLink}`;

  const subject = 'You have been invited to Honpe Portal';

  const sent = await emailService.sendEmailViaNodeMailer({
    to: user.email,
    subject,
    text: null,
    html: createHtmlTemplate(name, emailContent, subject),
  });
  if (!sent) {
    await user.remove();
    return next(new CustomError('User invitation failed', 400));
  }

  // todo sendemail
  res.status(200).json({
    success: true,
    message: 'Invitation sent successfully',
  });
});

export const checkInvitationToken = BigPromise(async (req, res, next) => {
  const { token } = req.params;
  const user = await User.findOne({ invitationToken: token });
  if (!user) {
    return next(new CustomError('Invalid token', 400));
  }
  res.status(200).json({ success: true, user });
});
export const registerInvitedUser = BigPromise(async (req, res, next) => {
  const { token, password, confirmPassword, email } = req.body;
  const user = await User.findOne({
    invitationToken: token,
    email,
  });
  if (!user) {
    return next(new CustomError('Invalid token or email not valid', 400));
  }
  if (password !== confirmPassword) {
    return next(new CustomError('Password do not match', 400));
  }
  user.password = password;
  user.invitationToken = undefined;
  user.isActive = true;
  await user.save();
  user.password = undefined;
  res.status(200).json({ success: true, user });
});
export const generateRefreshToken = BigPromise(async (req, res, next) => {
  const { refreshToken } = req.body;
  // Find the user in the database
  const user = await User.findOne({
    _id: req.user.id,
    tokens: refreshToken,
  }).select('+tokens');

  if (!user) {
    return next(new CustomError('invalid token', 400));
  }

  // Verify the refresh token
  const decoded: string | JwtPayload = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET as string
  );
  if (decoded.id !== user.id) {
    return next(new CustomError('invalid user', 400));
  }
  // Generate a new access token
  const accessToken = user.getJwtAccessToken();
  user.tokens.push(accessToken);
  await user.save();

  // Return the new access token
  return res.status(200).json({
    success: true,
    accessToken,
  });
});

export const logout = BigPromise(
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const accessToken = req.accessToken || req.body.accessToken;
    const { refreshToken } = req.body;
    if (!accessToken || !refreshToken) {
      return next(new CustomError('tokens not provided', 400)); // Invalid tokens
    }
    // Remove both tokens from the user's document
    const result = await User.updateOne(
      { _id: req.user._id },
      { $pullAll: { tokens: [accessToken, refreshToken] } }
    );

    if (result.nModified === 0) {
      return next(new CustomError('invalid tokens', 400)); // Invalid tokens
    }
    res.status(200).json({
      success: true,
      message: 'Logout success',
    });
  }
);
export const logoutAllDevices = BigPromise(
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const result = await User.updateOne(
      { _id: req.user._id },
      { $set: { tokens: [] } },
      { new: true }
    );

    if (!result) {
      return next(new CustomError('invalid user', 400)); // Invalid tokens
    }
    res.status(200).json({
      success: true,
      message: 'Logout success',
    });
  }
);

// Password Management Methods
export const forgotPassword = BigPromise(async (req, res, next) => {
  // collect email
  const { email } = req.body;

  // find user in database
  const user = await User.findOne({ email });

  // if user not found in database
  if (!user) {
    return next(new CustomError('Email not found as registered', 400));
  }

  // get token from user model methods
  const forgotToken = user.getForgotPasswordToken();

  // save user fields in DB,
  // we need to do this because we are just setting the fields and not saving
  // also note we don't want re-run the validations for fields to avoid errors.
  // set validateBeforeSave: false
  await user.save({ validateBeforeSave: false });

  // create a URL, it depends on the frontend guy how he want to manage it.
  // may ask him which url you have to put here
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/password/reset/${forgotToken}`;

  // craft a message, simple as this

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const message = `Copy paste this link in your URL and hit enter \n\n ${resetUrl}`;

  // attempt to send email, it depends how you want to send it
  try {
    // like so with sendEmailSendGrid
    // await mailHelper.sendEmailSendGrid(..args)
    // or any other service that
    // nodemailer
    // await mailHelper.sendEmailNodeMailer({
    //   email: user.email,
    //   subject: 'Password reset link',
    //   message,
    // });

    // for now console log
    // console.log(message);

    // json reponse if email is success
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    // reset user fields if things goes wrong
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // send error response
    return next(new CustomError(error.message, 500));
  }
});

// password reset for db solution
export const passwordReset = BigPromise(async (req, res, next) => {
  // get token from params
  const { token } = req.params; // you can also use body, change the route

  // hash the token as db also stores the hashed version
  const encryToken = crypto.createHash('sha256').update(token).digest('hex');

  // find user based on hased on token and time in future
  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError('Token is invalid or expired', 400));
  }

  // check if password and conf password matched
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError('password and confirm password do not match', 400)
    );
  }

  // update password field in DB
  user.password = req.body.password;

  // reset token fields
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  // save the user
  await user.save();

  // send a JSON response OR send token
  cookieToken(user, res);
});
// forgot password with Jwt solution
export const forgotPasswordJwt = BigPromise(async (req, res, next) => {
  // collect email
  const { email } = req.body;

  // find user in database
  const user = await User.findOne({ email });

  // if user not found in database
  if (!user) {
    return next(new CustomError('Email not found as registered', 400));
  }

  // get token from user model methods this time jwt
  const forgotToken = user.getForgotPasswordJwtToken();

  // save user fields in DB,
  // we need to do this because we are just setting the fields and not saving
  // also note we don't want re-run the validations for fields to avoid errors.
  // set validateBeforeSave: false
  await user.save({ validateBeforeSave: false });

  // create a URL, it depends on the frontend guy how he want to manage it.
  // may ask him which url you have to put here
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/password/reset/${forgotToken}`;

  // craft a message, simple as this
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const message = `Copy paste this link in your URL and hit enter \n\n ${resetUrl}`;

  // attempt to send email, it depends how you want to send it
  try {
    // like so with sendEmailSendGrid
    // await mailHelper.sendEmailSendGrid(..args)
    // or any other service that
    // nodemailer
    // await mailHelper.sendEmailNodeMailer({
    //   email: user.email,
    //   subject: 'Password reset link',
    //   message,
    // });

    // for now console log
    // console.log(message);

    // json reponse if email is success
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    // reset user fields if things goes wrong
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // send error response
    return next(new CustomError(error.message, 500));
  }
});

// password reset for JwtTokenb solution
export const passwordResetJwtToken = BigPromise(async (req, res, next) => {
  // get token from params
  const { token } = req.params; // you can also use body, change the route

  // hash the token as db also stores the hashed version
  const encryToken = veryfyJwtToken(token);

  if (!encryToken.isValid) {
    // please check encryToken.err for better message
    return next(new CustomError('Token is invalid or expired', 400));
  }
  // find user based on hased on token and time in future
  const user = await User.findOne({
    _id: encryToken.decoded.id,
    email: encryToken.decoded.email,
  });

  if (!user) {
    return next(new CustomError('Token is invalid or expired', 400));
  }

  // check if password and conf password matched
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError('password and confirm password do not match', 400)
    );
  }

  // update password field in DB
  user.password = req.body.password;

  // reset token fields
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  // save the user
  await user.save();

  // send a JSON response OR send token
  cookieToken(user, res);
});

// User Profile Methods
export const getLoggedInUserDetails = BigPromise(async (req, res) => {
  // req.user will be added by middleware
  // find user by id
  const user = await User.findById(req.user.id).populate('factory');

  // send response and user data
  res.status(200).json({
    success: true,
    user,
  });
});

export const changePassword = BigPromise(async (req, res, next) => {
  // get user from middleware
  const userId = req.user.id;

  // get user from database
  const user = await User.findById(userId).select('+password');

  // check if old password is correct
  const isCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );

  if (!isCorrectOldPassword) {
    return next(new CustomError('old password is incorrect', 400));
  }

  // allow to set new password
  user.password = req.body.password;

  // save user and send fresh token
  await user.save();
  cookieToken(user, res);
});

export const updateUserDetails = BigPromise(async (req, res, next) => {
  const updateObj = { ...req.body };

  // Define an array of properties that should not be updated
  const restrictedProperties =
    RESTRICTED_UPDATE_USER_PROPERTIES_BASED_ON_ROLE[req.user.role];
  // Check if any restricted property exists in the request body
  const hasRestrictedProperties = restrictedProperties.some(
    (prop) => prop in updateObj
  );

  if (hasRestrictedProperties) {
    return next(
      new CustomError('You cannot update some properties from this route', 400)
    );
  }
  if ('name' in updateObj && 'surname' in updateObj) {
    updateObj.fullName = `${updateObj.name} ${updateObj.surname}`;
  }

  // update the data in user
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: updateObj,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    user,
  });
});

// Admin User Management Methods
export const adminAllUser = BigPromise(async (req, res) => {
  const firstQ: any = {};
  const usersObj = new WhereClauseUser(req.query, firstQ);
  const result = await usersObj.exec();
  res.status(200).json({
    success: true,
    ...result,
  });
});

export const adminGetOneUser = BigPromise(async (req, res, next) => {
  // get id from url and get user from database

  const user = await User.findOne({ uid: req.params.id });

  if (!user) {
    next(new CustomError('No user found', 400));
  }
  // send user
  res.status(200).json({
    success: true,
    user,
  });
});
export const adminUpdateUserDetails = BigPromise(async (req, res, next) => {
  const updateObj = { ...req.body };

  // Define an array of properties that should not be updated
  const restrictedProperties =
    RESTRICTED_UPDATE_USER_PROPERTIES_BASED_ON_ROLE[req.user.role];
  // Check if any restricted property exists in the request body
  const hasRestrictedProperties = restrictedProperties.some(
    (prop) => prop in updateObj
  );

  if (hasRestrictedProperties) {
    return next(
      new CustomError('You cannot update some properties from this route', 400)
    );
  }
  const user = await User.findOne({ uid: req.params.id });
  if (!user) {
    return next(new CustomError('No Such user found', 400));
  }
  if ('password' in updateObj) {
    if (updateObj.password.length < 6) {
      return next(
        new CustomError('Password must be at least 6 characters', 400)
      );
    }
    if (updateObj.password !== updateObj.confirmPassword) {
      return next(
        new CustomError('Password and confirm password must match', 400)
      );
    }
  }
  if ('email' in updateObj) {
    const existingUser = await User.findOne({
      uid: { $ne: req.params.id },
      email: updateObj.email,
    });
    if (existingUser) {
      return next(new CustomError('Email already exists', 400));
    }
  }
  if ('name' in updateObj && 'surname' in updateObj) {
    updateObj.fullName = `${updateObj.name} ${updateObj.surname}`;
  }
  // Update other fields
  Object.keys(updateObj).forEach((key) => {
    user[key] = updateObj[key];
  });

  await user.save({ validateBeforeSave: true });
  user.password = undefined;
  if ('password' in updateObj) {
    const subject = `Your Password Has Been Reset`;
    const dashboardLink = `${req.get('origin')}/dashboard`;
    const adminEmail = req.user.email; // Assuming this is the admin's email

    const content = `
  <p>Your password has been successfully reset by an administrator.</p>
  <ul>
    <li><strong>Full Name:</strong> ${user.fullName}</li>
    <li><strong>Email:</strong> ${user.email}</li>
  </ul>
  <p>Please contact the administrator at <a href="mailto:${adminEmail}">${adminEmail}</a> to receive your new password.</p>
  <hr/>
  Click below to go the Dashboard
  ${dashboardLink}
`;

    await createNotification({
      content,
      type: 'user-password-reset-success',
      subject,
      targetUsers: [user._id],
    });
  }
  res.status(200).json({
    success: true,
    user,
  });
});
export const adminDeleteOneUser = BigPromise(async (req, res, next) => {
  // get user from url
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError('No Such user found', 400));
  }

  // remove user from databse
  await user.remove();

  res.status(200).json({
    success: true,
  });
});

export const adminAskForPasswordReset = BigPromise(async (req, res) => {
  // email is provided by the user we havbe to notify users with admin role that a password reset is requested
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If the user is found admin will be notified',
    });
  }
  const targetRoles = ['admin'];
  const subject = `Password Reset Request from ${user.fullName} (${user.email})`;
  const dashboardLink = `${req.get('origin')}/dashboard`;
  const content = `
      <p>A password reset has been requested for the following user:</p>
      <ul>
        <li><strong>Full Name:</strong> ${user.fullName}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Role:</strong> ${user.role}</li>
      </ul>
      <p>Please review and take appropriate action.</p>
      <hr/>
      Click here to go to the Dashboard ${dashboardLink}
    `;
  await createNotification({
    content,
    type: 'password-reset',
    subject,
    targetRoles,
  });
  return res.status(200).json({
    success: true,
    message: 'If the user is found admin will be notified',
  });
});
