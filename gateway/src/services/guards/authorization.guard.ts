import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { IUser } from '../../interfaces/user/user.interface';
import { IHttpResponse } from '../../interfaces/gateway/http-response.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const secured = this.reflector.get<string[]>(
      'secured',
      context.getHandler(),
    );

    if (!secured) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userTokenInfo: IHttpResponse<{
      userId: string;
    }> = await this.userServiceClient
      .send('token_decode', {
        token: request.headers.authorization,
      })
      .toPromise();

    if (!userTokenInfo || !userTokenInfo.data) {
      throw new HttpException(
        {
          message: userTokenInfo.message,
        },
        userTokenInfo.status,
      );
    }

    const userInfo: IHttpResponse<IUser> = await this.userServiceClient
      .send('user_get_by_id', userTokenInfo.data.userId)
      .toPromise();

    request.user = userInfo.data;
    return true;
  }
}
