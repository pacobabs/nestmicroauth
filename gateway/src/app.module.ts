import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientProxyFactory } from '@nestjs/microservices';

import { UsersController } from './users.controller';
import { GoogleUsersController } from './users.google.controller';
import { FacebookUsersController } from './users.facebook.controller';

import { AuthGuard } from './services/guards/authorization.guard';

import { ConfigService } from './services/config/config.service';
import { GoogleAuthService } from './services/google.auth.service';
import { FacebookAuthService } from './services/facebook.auth.service';

@Module({
  controllers: [
    UsersController,
    GoogleUsersController,
    FacebookUsersController,
  ],
  providers: [
    ConfigService,
    GoogleAuthService,
    FacebookAuthService,
    {
      provide: 'USER_SERVICE',
      useFactory: (configService: ConfigService) => {
        const userServiceOptions = configService.get('userService');
        return ClientProxyFactory.create(userServiceOptions);
      },
      inject: [ConfigService],
    },

    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
