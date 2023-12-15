import { Request } from 'express';

export type Nullable<T> = T | undefined | null;
export type RolesType = string[] | number[];
export interface IGetUserAuthInfoRequest extends Request {
  user?: any; // or any other type
  accessToken?: string | undefined | null;
  //add as need
}
