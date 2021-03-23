import {
  Inject,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { IHttpResponse } from './interfaces/gateway/http-response.interface';

import { UserTokenResponseDto } from './interfaces/user/dto/user-token-response.dto';
import { IUser } from './interfaces/user/user.interface';

@Controller('facebook')
@ApiTags('facebook')
export class FacebookUsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Get()
  @ApiOkResponse()
  @UseGuards(AuthGuard('facebook'))
  public async facebookAuth(@Req() req) {}

  @Get('redirect')
  @ApiOkResponse({
    type: UserTokenResponseDto,
  })
  @UseGuards(AuthGuard('facebook'))
  public async facebookAuthRedirect(
    @Req() req,
    @Res() res,
  ): Promise<IHttpResponse<IUser>> {
    try {
      const getUserResponse: IHttpResponse<IUser> = await this.userServiceClient
        .send('oauth2_login', req.user)
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

      const { accessToken, refreshToken } = createTokenResponse.data;

      return res.redirect(
        `${process.env.FRONTEND_URL}/redirect?&at=${accessToken}&rt=${refreshToken}`,
      );
    } catch (e) {
      return {
        status: e.status || HttpStatus.BAD_REQUEST,
        message: e.message || e,
        errors: e.errors,
      };
    }
  }
}
