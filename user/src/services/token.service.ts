import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { IToken } from '../interfaces/token.interface';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';

export interface RefreshTokenPayload {
  jti: string;
  sub: string;
}

const BASE_OPTIONS: SignOptions = {
  issuer: process.env.BASE_URI,
  audience: process.env.FRONTEND_URL,
};

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('Token') private readonly tokenModel: Model<IToken>,
  ) {}

  public deleteTokenForUserId(userId: string): Query<any> {
    return this.tokenModel.deleteOne({
      user_id: userId,
    });
  }

  public async decodeToken(
    token: string,
  ): Promise<{ userId: string } | undefined> {
    try {
      const tokenData = this.jwtService.decode(token) as {
        exp: number;
        userId: any;
      };
      if (!tokenData || tokenData.exp <= Math.floor(+new Date() / 1000)) {
      } else {
        const tokenModel = await this.tokenModel
          .find({ user_id: tokenData.userId })
          .exec();
        if (tokenModel && tokenModel[0]) {
          return {
            userId: tokenData.userId,
          };
        }
      }
    } catch {}
  }

  public async generateAccessToken(userId: string): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn: '60m',
      subject: userId,
    };

    return this.jwtService.signAsync({ userId }, opts);
  }

  public async generateRefreshToken(userId: string): Promise<string> {
    await this.deleteTokenForUserId(userId);

    const token = await new this.tokenModel({
      user_id: userId,
    }).save();

    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn: '43200m',
      subject: String(userId),
      jwtid: String(token.id),
    };

    return this.jwtService.signAsync({ userId }, opts);
  }

  public async getUserIdFromRefreshToken(encoded: string): Promise<string> {
    const payload = await this.decodeRefreshToken(encoded);
    const token_id = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token_id) {
      throw new UnprocessableEntityException('Refresh token not found');
    }

    const user_id = await this.getUserFromRefreshTokenPayload(payload);

    if (!user_id) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return user_id;
  }

  public async createAccessTokenFromRefreshToken(
    refresh: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user_id = await this.getUserIdFromRefreshToken(refresh);

    const accessToken = await this.generateAccessToken(user_id);
    const refreshToken = await this.generateRefreshToken(user_id);

    return { accessToken, refreshToken };
  }

  private async decodeRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  private async getUserFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<string | null> {
    const user_id = payload.sub;

    if (!user_id) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return user_id;
  }

  private async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<string | null> {
    const tokenId = payload.jti;

    const tokenModel = await this.tokenModel.findById(tokenId).exec();

    if (!tokenModel || !tokenModel[0]) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return tokenModel[0].id;
  }
}
