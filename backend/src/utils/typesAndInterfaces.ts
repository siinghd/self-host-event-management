import { Request } from 'express';
import { IUser } from '../models/user.model';

export type Nullable<T> = T | undefined | null;
export type RolesType = string[] | number[];
export interface IGetUserAuthInfoRequest extends Request {
  user?: IUser; // or any other type
  accessToken?: string | undefined | null;
  //add as need
}
