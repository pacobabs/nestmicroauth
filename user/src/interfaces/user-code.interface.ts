import { Document } from 'mongoose';

export interface IUserCode extends Document {
  id?: string;
  user_id: string;
  code: string;
  is_used: boolean;
}
