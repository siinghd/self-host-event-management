/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
import crypto from 'crypto';

import mongoose from 'mongoose';
import validator from 'validator';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { customAlphabet } from 'nanoid';
import { CustomError } from '../utils/customError';
import logger from '../utils/logger/logger';

const nanoid = customAlphabet('1234567890abcdef', 6);

const userSchema: mongoose.Schema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: [true, 'Please provide a uid'],
      unique: true,
      default: () => `u${nanoid()}`,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [40, 'Name should be under 40 characters'],
    },
    fullName: {
      type: String,
    },
    surname: {
      type: String,
      required: [true, 'Please provide a surname'],
      maxlength: [40, 'Surname should be under 40 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      validate: [validator.isEmail, 'Please enter email in correct format'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'password should be atleast 6 char'],
      select: false, // select false, we don't want to return
      // the encrypted password in every find
      // user must select it manually ex: await User.findOne({ email }).select('+password');
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a phone number'],
      maxlength: [15, 'Phone number should be under 15 characters'],
      validate: [
        validator.isMobilePhone,
        'Please enter phone number in correct format',
      ],
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
    isActive: { type: Boolean, default: false },
    invitationToken: { type: String },
    tokens: [{ type: String, select: false }],
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  { timestamps: true }
);

// encrypt password before save - HOOKS
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await argon2.hash(this.password);
  } catch (err: any) {
    this.password = '';
    next(new CustomError('Error in Encrypting the user password.', 422));
  }
});
// // Create a virtual property `fullName` that's computed from `firstname and lastname`.
// userSchema.virtual('fullName').get(function () {
//   return `${this.name} ${this.surname}}`;
// });
// validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function (
  usersendPassword: string
) {
  try {
    return await argon2.verify(this.password, usersendPassword);
  } catch (err: any) {
    logger.error({
      message: 'Error in isValidatedPassword, could not validate the password',
      meta: {
        stack: err.stack || '',
        method: 'userSchema.methods.isValidatedPassword',
      },
    });
  }
};

// create and return jwt access token
userSchema.methods.getJwtAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY,
  });
};
// create and return jwt REFRESH token
userSchema.methods.getJwtRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  });
};
// generate forgot password token (string) // db solution
userSchema.methods.getForgotPasswordToken = function () {
  // generate a long and randomg string
  const forgotToken = crypto.randomBytes(20).toString('hex');

  // getting a hash - make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash('sha256')
    .update(forgotToken)
    .digest('hex');

  // time of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};

// generate forgot password token (string) // jwt Token solution
userSchema.methods.getForgotPasswordJwtToken = function () {
  // generate jwt token with id and email(not needed)
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRY,
    }
  );
};

// Index for unique fields
userSchema.index({ uid: 1 });
userSchema.index({ email: 1 });

// Index for frequently queried fields
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });


// Index for text-based searches (if needed)
// userSchema.index({ name: 'text', surname: 'text' });

// Index for timestamps
userSchema.index({ createdAt: 1 });
userSchema.index({ updatedAt: 1 });

// Index for fields that might be used in sorting or filtering
userSchema.index({ phoneNumber: 1 });

export = mongoose.model('User', userSchema);
