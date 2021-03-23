import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nest-modules/mailer';
import { UserController } from './user.controller';
import { TokenController } from './token.controller';
import { UserService } from './services/user.service';
import { TokenService } from './services/token.service';
import { JwtConfigService } from './services/config/jwt-config.service';
import { MongoConfigService } from './services/config/mongo-config.service';
import { MailerConfigService } from './services/config/mailer-config.service';
import { ConfigService } from './services/config/config.service';
import { TokenSchema } from './schemas/token.schema';
import { UserSchema } from './schemas/user.schema';
import { UserResetCodeSchema } from './schemas/user-reset-code.schema';
import { UserCodeSchema } from './schemas/user-code.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    MailerModule.forRootAsync({
      useClass: MailerConfigService,
    }),
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'Token',
        schema: TokenSchema,
      },
      {
        name: 'User',
        schema: UserSchema,
        collection: 'users',
      },
      {
        name: 'UserResetCode',
        schema: UserResetCodeSchema,
        collection: 'user_reset_codes',
      },
      {
        name: 'UserCode',
        schema: UserCodeSchema,
        collection: 'user_confirm_codes',
      },
    ]),
  ],
  controllers: [UserController, TokenController],
  providers: [UserService, TokenService, ConfigService],
})
export class UserModule {}
