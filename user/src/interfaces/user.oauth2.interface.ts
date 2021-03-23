import { Document } from 'mongoose';

export interface IOAuthUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  token: string;
  refreshToken: string;
}
