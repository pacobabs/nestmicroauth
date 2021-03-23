import { Document } from 'mongoose';

export interface IUserResetCode extends Document {
  id?: string;
  user_id: string;
  user_email: string;
  code: string;
  is_used: boolean;
}
