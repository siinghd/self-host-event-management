/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';
import { CustomError } from '../utils/customError';
import logger from '../utils/logger/logger';

const nanoid = customAlphabet('1234567890abcdef', 6);

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

interface BillingAddress {
  zipCode?: string;
  street?: string;
  building?: string;
  country?: string;
  city?: string;
  state?: string;
}

export interface IUser {
  uid: string;
  name: string;
  fullName?: string;
  surname: string;
  email: string;
  password: string;
  billingAddress?: BillingAddress;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  invitationToken?: string;
  tokens?: string[];
  forgotPasswordToken?: string;
  forgotPasswordExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserModel extends mongoose.Document, IUser {
  isValidatedPassword(usersendPassword: string): Promise<boolean>;
  getJwtAccessToken(): string;
  getJwtRefreshToken(): string;
  getForgotPasswordToken(): string;
  getForgotPasswordJwtToken(): string;
}

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
      minlength: [6, 'Password should be at least 6 characters'],
      select: false,
    },
    billingAddress: {
      zipCode: { type: String },
      street: { type: String },
      building: { type: String },
      country: { type: String },
      city: { type: String },
      state: { type: String },
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
      default: UserRole.User,
      enum: Object.values(UserRole),
    },
    isActive: { type: Boolean, default: false },
    invitationToken: { type: String },
    tokens: [{ type: String, select: false }],
    forgotPasswordToken: { type: String },
    forgotPasswordExpiry: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre<IUserModel>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await argon2.hash(this.password);
  } catch (err) {
    this.password = '';
    next(new CustomError('Error in Encrypting the user password.', 422));
  }
});

userSchema.methods.isValidatedPassword = async function (
  usersendPassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(this.password, usersendPassword);
  } catch (err) {
    logger.error({
      message: 'Error in isValidatedPassword, could not validate the password',
      meta: {
        stack: (err as Error).stack || '',
        method: 'userSchema.methods.isValidatedPassword',
      },
    });
    return false;
  }
};

userSchema.methods.getJwtAccessToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY,
  });
};

userSchema.methods.getJwtRefreshToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  });
};

userSchema.methods.getForgotPasswordToken = function (): string {
  const forgotToken = crypto.randomBytes(20).toString('hex');
  this.forgotPasswordToken = crypto
    .createHash('sha256')
    .update(forgotToken)
    .digest('hex');
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
  return forgotToken;
};

userSchema.methods.getForgotPasswordJwtToken = function (): string {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRY,
    }
  );
};

userSchema.index({ uid: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ updatedAt: 1 });
userSchema.index({ phoneNumber: 1 });

export const UserModel = mongoose.model<IUserModel>('User', userSchema);
