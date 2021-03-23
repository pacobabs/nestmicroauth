import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TokenService } from './services/token.service';
import { IHttpResponse } from './interfaces/http-response.interface';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @MessagePattern('token_create')
  public async createToken(data: { userId: string }): Promise<IHttpResponse> {
    if (data && data.userId) {
      try {
        const accessToken = await this.tokenService.generateAccessToken(
          data.userId,
        );
        const refreshToken = await this.tokenService.generateRefreshToken(
          data.userId,
        );
        return {
          status: HttpStatus.CREATED,
          message: 'token_create_success',
          data: { accessToken, refreshToken },
        };
      } catch (e) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: e,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'token_create_bad_request',
      };
    }
  }

  @MessagePattern('token_destroy')
  public async destroyToken(data: { userId: string }): Promise<IHttpResponse> {
    return {
      status: data && data.userId ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message:
        data && data.userId
          ? (await this.tokenService.deleteTokenForUserId(data.userId)) &&
            'token_destroy_success'
          : 'token_destroy_bad_request',
    };
  }

  @MessagePattern('token_decode')
  public async decodeToken(data: { token: string }): Promise<IHttpResponse> {
    const tokenData = await this.tokenService.decodeToken(data.token);
    return {
      status: tokenData ? HttpStatus.OK : HttpStatus.UNAUTHORIZED,
      message: tokenData ? 'token_decode_success' : 'token_decode_unauthorized',
      data: tokenData,
    };
  }

  @MessagePattern('token_refresh')
  public async refreshToken(token: string): Promise<IHttpResponse> {
    try {
      const tokenData = await this.tokenService.createAccessTokenFromRefreshToken(
        token,
      );
      return {
        status: tokenData ? HttpStatus.OK : HttpStatus.UNAUTHORIZED,
        message: tokenData
          ? 'token_decode_success'
          : 'token_decode_unauthorized',
        data: tokenData,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: e,
      };
    }
  }
}
