import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ConfigService } from './config/config.service';
import { IUser } from '../interfaces/user.interface';
import { IOAuthUser } from '../interfaces/user.oauth2.interface';
import { IUserCode } from '../interfaces/user-code.interface';
import { IUserResetCode } from '../interfaces/user-link.interface';

function generateCode() {
  // 6 digit code
  const sixDigits = 1000000;
  return (Math.floor(Math.random() * sixDigits) + sixDigits)
    .toString()
    .substring(1);
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel('UserCode') private readonly userCodeModel: Model<IUserCode>,
    @InjectModel('UserResetCode')
    private readonly userResetCodeModel: Model<IUserResetCode>,
    private readonly configService: ConfigService,
  ) {}

  public async searchUser(params: { email: string }): Promise<IUser[]> {
    return this.userModel.find(params).exec();
  }

  public async searchUserById(id: string): Promise<IUser> {
    return this.userModel.findById(id).exec();
  }

  public async updateUserByEmail(
    email: string,
    userParams: { is_confirmed: boolean },
  ): Promise<IUser> {
    const user = await this.userModel.find({ email }).exec();
    return this.userModel.updateOne({ _id: user[0].id }, userParams).exec();
  }

  public async createUser(user: IUser): Promise<IUser> {
    const userModel = new this.userModel(user);
    return await userModel.save();
  }

  public async createGoogleUser(user: IOAuthUser): Promise<IUser> {
    const userModel = new this.userModel({
      email: user.email,
      password: user.token,
      is_confirmed: true,
    });
    return await userModel.save();
  }

  public async resetPassword(id: string, password: string): Promise<IUser> {
    return this.userModel.updateOne({ _id: id }, { password }).exec();
  }

  public async createPasswordResetCode(
    id: string,
    email: string,
  ): Promise<IUserResetCode> {
    const userCode = await this.userResetCodeModel
      .find({ user_email: email, is_used: false })
      .exec();
    if (userCode && userCode[0]) {
      await this.deleteUserResetCode(userCode[0].id);
    }
    const userResetCodeModel = new this.userResetCodeModel({
      code: generateCode(),
      user_id: id,
      user_email: email,
    });
    return await userResetCodeModel.save();
  }

  public async createUserCode(email: string): Promise<IUserCode> {
    const userCode = await this.userCodeModel
      .find({ user_email: email, is_used: false })
      .exec();
    if (userCode && userCode[0]) {
      await this.deleteUserCode(userCode[0].id);
    }
    const userCodeModel = new this.userCodeModel({
      code: generateCode(),
      email,
    });
    return await userCodeModel.save();
  }

  public async getUserResetCode(code: string): Promise<IUserResetCode[]> {
    return this.userResetCodeModel.find({ code, is_used: false }).exec();
  }

  public async deleteUserResetCode(id: string) {
    return this.userResetCodeModel.deleteOne({ _id: id });
  }

  public async getUserCode(email: string, code: string): Promise<IUserCode[]> {
    return this.userCodeModel.find({ email, code, is_used: false }).exec();
  }

  public async deleteUserCode(id: string) {
    return this.userCodeModel.deleteOne({ _id: id });
  }
}
