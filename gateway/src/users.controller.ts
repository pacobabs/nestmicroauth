import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Req,
  Inject,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

import { Authorization } from './decorators/authorization.decorator';
import { IAuthorizedRequest } from './interfaces/gateway/authorized-request.interface';
import { IHttpResponse } from './interfaces/gateway/http-response.interface';

import { HttpResponseDto } from './interfaces/user/dto/http-response.dto';
import { UserTokenResponseDto } from './interfaces/user/dto/user-token-response.dto';
import { UserResponseDto } from './interfaces/user/dto/user-response.dto';
import { CreateUserDto } from './interfaces/user/dto/create-user.dto';
import { LoginUserDto } from './interfaces/user/dto/login-user.dto';
import { RefreshTokenDto } from './interfaces/user/dto/refresh-token.dto';
import { ConfirmUserDto } from './interfaces/user/dto/confirm-user.dto';
import { PasswordResetDto } from './interfaces/user/dto/password-reset.dto';
import { PasswordResetSubmitDto } from './interfaces/user/dto/password-reset-submit.dto';
import { IUser } from './interfaces/user/user.interface';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Get()
  @Authorization(true)
  @ApiOkResponse({
    type: UserResponseDto,
  })
  public async getUserByToken(
    @Req() request: IAuthorizedRequest,
  ): Promise<IHttpResponse<IUser>> {
    try {
      const userResponse: IHttpResponse<IUser> = await this.userServiceClient
        .send('user_get_by_id', request.user.id)
        .toPromise();
      return {
        status: HttpStatus.OK,
        message: userResponse.message,
        data: userResponse.data,
      };
    } catch (e) {
      return {
        status: e.status || HttpStatus.BAD_REQUEST,
        message: e.message || e,
        errors: e.errors,
      };
    }
  }

  @Post()
  @ApiCreatedResponse({
    type: UserTokenResponseDto,
  })
  public async createUser(
    @Body() userRequest: CreateUserDto,
  ): Promise<IHttpResponse<IUser>> {
    try {
      const createUserResponse: IHttpResponse<IUser> = await this.userServiceClient
        .send('user_create', userRequest)
        .toPromise();
      if (createUserResponse.status !== HttpStatus.CREATED) {
        throw new HttpException(
          {
            message: createUserResponse.message,
            errors: createUserResponse.errors,
          },
          createUserResponse.status,
        );
      }

      const createTokenResponse: IHttpResponse<{
        accessToken: string;
        refreshToken: string;
      }> = await this.userServiceClient
        .send('token_create', {
          userId: createUserResponse.data.id,
        })
        .toPromise();

      if (createTokenResponse.status !== HttpStatus.CREATED) {
        throw new HttpException(
          {
            message: createTokenResponse.message,
            errors: createTokenResponse.errors,
          },
          createTokenResponse.status,
        );
      }

      return {
        status: HttpStatus.OK,
        message: createUserResponse.message,
        data: {
          ...createUserResponse.data,
          accessToken: createTokenResponse.data.accessToken,
          refreshToken: createTokenResponse.data.refreshToken,
        },
      };
    } catch (e) {
      return {
        status: e.status || HttpStatus.BAD_REQUEST,
        message: e.message || e,
        errors: e.errors,
      };
    }
  }

  @Post('/login')
  @ApiCreatedResponse({
    type: UserTokenResponseDto,
  })
  public async loginUser(
    @Body() loginRequest: LoginUserDto,
  ): Promise<IHttpResponse<IUser>> {
    try {
      const getUserResponse: IHttpResponse<IUser> = await this.userServiceClient
        .send('user_search_by_credentials', loginRequest)
        .toPromise();

      if (getUserResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: getUserResponse.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const createTokenResponse: IHttpResponse<{
        accessToken: string;
        refreshToken: string;
      }> = await this.userServiceClient
        .send('token_create', {
          userId: getUserResponse.data.id,
        })
        .toPromise();

      return {
        status: HttpStatus.OK,
        message: createTokenResponse.message,
        data: {
          ...getUserResponse.data,
          accessToken: createTokenResponse.data.accessToken,
          refreshToken: createTokenResponse.data.refreshToken,
        },
      };
    } catch (e) {
      return {
        status: e.status || HttpStatus.BAD_REQUEST,
        message: e.message || e,
        errors: e.errors,
      };
    }
  }

  @Post('/refresh')
  public async refresh(@Body() refreshRequest: RefreshTokenDto) {
    try {
      const refreshResponse: IHttpResponse<{
        accessToken: string;
        refreshToken: string;
      }> = await this.userServiceClient
        .send('token_refresh', refreshRequest.token)
        .toPromise();

      if (refreshResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: refreshResponse.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        status: HttpStatus.OK,
        message: 'refresh_token_success',
        data: refreshResponse.data,
      };
    } catch (e) {
      return {
        status: e.status || HttpStatus.BAD_REQUEST,
        message: e.message || e,
        errors: e.errors,
      };
    }
  }

  @Put('/logout')
  @Authorization(true)
  @ApiCreatedResponse({
    type: HttpResponseDto,
  })
  public async logoutUser(
    @Req() request: IAuthorizedRequest,
  ): Promise<IHttpResponse<undefined>> {
    try {
      const destroyTokenResponse: IHttpResponse<undefined> = await this.userServiceClient
        .send('token_destroy', {
          userId: request.user.id,
        })
        .toPromise();

      if (destroyTokenResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: destroyTokenResponse.message,
            errors: destroyTokenResponse.errors,
          },
          destroyTokenResponse.status,
        );
      }

      return {
        status: HttpStatus.OK,
        message: destroyTokenResponse.message,
      };
    } catch (e) {
      return {
        status: e.status || HttpStatus.BAD_REQUEST,
        message: e.message || e,
        errors: e.errors,
      };
    }
  }

  @Post('/confirm')
  @ApiCreatedResponse({
    type: HttpResponseDto,
  })
  public async confirmUser(
    @Body() confirmRequest: ConfirmUserDto,
  ): Promise<IHttpResponse<undefined>> {
    try {
      const confirmUserResponse: IHttpResponse<IUser> = await this.userServiceClient
        .send('user_confirm', {
          email: confirmRequest.email,
          code: confirmRequest.code,
        })
        .toPromise();

      if (confirmUserResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: confirmUserResponse.message,
            errors: confirmUserResponse.errors,
          },
          confirmUserResponse.status,
        );
      }

      return {
        status: HttpStatus.OK,
        message: confirmUserResponse.message,
      };
    } catch (e) {
      return {
        status: e.status || HttpStatus.BAD_REQUEST,
        message: e.message || e,
        errors: e.errors,
      };
    }
  }

  @Post('/password/reset')
  @ApiCreatedResponse({
    type: HttpResponseDto,
  })
  public async sendPasswordResetCode(
    @Body() resetCodeRequest: PasswordResetDto,
  ): Promise<IHttpResponse<undefined>> {
    try {
      const passwordResetResponse: IHttpResponse<undefined> = await this.userServiceClient
        .send('password_reset_code', {
          email: resetCodeRequest.email,
        })
        .toPromise();

      if (passwordResetResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: passwordResetResponse.message,
            errors: passwordResetResponse.errors,
          },
          passwordResetResponse.status,
        );
      }

      return {
        status: HttpStatus.OK,
        message: passwordResetResponse.message,
      };
    } catch (e) {
      return {
        status: e.status || HttpStatus.BAD_REQUEST,
        message: e.message || e,
        errors: e.errors,
      };
    }
  }

  @Post('/password/reset/submit')
  @ApiCreatedResponse({
    type: HttpResponseDto,
  })
  public async resetPasswordSubmit(
    @Body() passwordResetRequest: PasswordResetSubmitDto,
  ): Promise<IHttpResponse<undefined>> {
    try {
      const confirmPasswordResetResponse: IHttpResponse<undefined> = await this.userServiceClient
        .send('password_reset', {
          code: passwordResetRequest.code,
          password: passwordResetRequest.password,
        })
        .toPromise();

      if (confirmPasswordResetResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: confirmPasswordResetResponse.message,
            errors: confirmPasswordResetResponse.errors,
          },
          confirmPasswordResetResponse.status,
        );
      }

      return {
        status: HttpStatus.OK,
        message: confirmPasswordResetResponse.message,
      };
    } catch (e) {
      return {
        status: e.status || HttpStatus.BAD_REQUEST,
        message: e.message || e,
        errors: e.errors,
      };
    }
  }
}
