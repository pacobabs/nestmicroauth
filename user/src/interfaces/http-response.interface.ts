import { IUser } from './user.interface';

export interface IHttpResponse {
  status: number;
  message: string;
  data?:
    | IUser
    | { accessToken: string; refreshToken: string }
    | { userId: string };
  errors?: { [key: string]: any };
}
