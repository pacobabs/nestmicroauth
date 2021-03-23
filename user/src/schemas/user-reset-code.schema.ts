import * as mongoose from 'mongoose';

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id;
}

export const UserResetCodeSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: [true, 'User can not be empty'],
    },
    user_email: {
      type: String,
      required: [true, 'User can not be empty'],
    },
    is_used: {
      type: Boolean,
      default: false,
    },
    code: {
      type: String,
    },
  },
  {
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
  },
);
