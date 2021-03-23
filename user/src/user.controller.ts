import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MailerService } from '@nest-modules/mailer';
import { UserService } from './services/user.service';
import { IHttpResponse } from './interfaces/http-response.interface';
import { IUser } from './interfaces/user.interface';
import { IOAuthUser } from './interfaces/user.oauth2.interface';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  @MessagePattern('user_search_by_credentials')
  public async searchUserByCredentials(searchParams: {
    email: string;
    password: string;
  }): Promise<IHttpResponse> {
    if (searchParams.email && searchParams.password) {
      const user = await this.userService.searchUser({
        email: searchParams.email,
      });

      if (user && user[0]) {
        if (await user[0].compareEncryptedPassword(searchParams.password)) {
          return {
            status: HttpStatus.OK,
            message: 'user_search_by_credentials_success',
            data: user[0],
          };
        } else {
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'user_search_by_credentials_not_match',
          };
        }
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'user_search_by_credentials_not_found',
        };
      }
    } else {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'user_search_by_credentials_not_found',
      };
    }
  }

  @MessagePattern('user_get_by_id')
  public async getUserById(id: string): Promise<IHttpResponse> {
    if (id) {
      const user = await this.userService.searchUserById(id);
      if (user) {
        return {
          status: HttpStatus.OK,
          message: 'user_get_by_id_success',
          data: user,
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'user_get_by_id_not_found',
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_get_by_id_bad_request',
      };
    }
  }

  @MessagePattern('user_confirm')
  public async confirmUser(confirmParams: {
    email: string;
    code: string;
  }): Promise<IHttpResponse> {
    if (confirmParams) {
      const userCode = await this.userService.getUserCode(
        confirmParams.email,
        confirmParams.code,
      );
      if (userCode && userCode[0]) {
        await this.userService.updateUserByEmail(confirmParams.email, {
          is_confirmed: true,
        });
        await this.userService.deleteUserCode(userCode[0].id);
        return {
          status: HttpStatus.OK,
          message: 'user_confirm_success',
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'user_confirm_not_found',
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_confirm_bad_request',
      };
    }
  }

  @MessagePattern('password_reset_code')
  public async sendPasswordResetCode(resetCodeParams: {
    email: string;
  }): Promise<IHttpResponse> {
    if (resetCodeParams) {
      const user = await this.userService.searchUser({
        email: resetCodeParams.email,
      });

      if (user && user[0]) {
        const userResetCode = await this.userService.createPasswordResetCode(
          user[0].id,
          user[0].email,
        );

        this.mailerService.sendMail({
          to: userResetCode.user_email,
          subject: 'Changez votre mot de passe',
          html: `<center>
          <b>Bonjour, Voici le code pour changer votre mot de passe.</b>
          <br><br><h3>${userResetCode.code}</h3>
          </center>`,
        });

        return {
          status: HttpStatus.OK,
          message: 'password_reset_code_success',
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'user_search_by_credentials_not_found',
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_confirm_bad_request',
      };
    }
  }

  @MessagePattern('password_reset')
  public async resetPassword(resetParams: {
    code: string;
    password: string;
  }): Promise<IHttpResponse> {
    if (resetParams) {
      const userResetCode = await this.userService.getUserResetCode(
        resetParams.code,
      );

      if (userResetCode && userResetCode[0]) {
        await this.userService.resetPassword(
          userResetCode[0].user_id,
          resetParams.password,
        );
        await this.userService.deleteUserResetCode(userResetCode[0].id);
        return {
          status: HttpStatus.OK,
          message: 'password_reset_success',
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'reset_code_not_found',
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_confirm_bad_request',
      };
    }
  }

  @MessagePattern('user_create')
  public async createUser(userParams: IUser): Promise<IHttpResponse> {
    if (userParams) {
      const usersWithEmail = await this.userService.searchUser({
        email: userParams.email,
      });

      if (usersWithEmail && usersWithEmail.length > 0) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'user_create_conflict',
          errors: {
            email: {
              message: 'Email already exists',
            },
          },
        };
      } else {
        try {
          userParams.is_confirmed = false;
          const createdUser = await this.userService.createUser(userParams);
          const userCode = await this.userService.createUserCode(
            createdUser.email,
          );
          delete createdUser.password;
          this.mailerService.sendMail({
            to: createdUser.email,
            subject: 'Confirmez votre email',
            html: `<center>
              <b>Bonjour, Voici le code pour confirmer votre email.</b>
              <br><br><h3>${userCode.code}</h3>
              </center>`,
          });
          return {
            status: HttpStatus.CREATED,
            message: 'user_create_success',
            data: createdUser,
          };
        } catch (e) {
          return {
            status: HttpStatus.PRECONDITION_FAILED,
            message: 'user_create_precondition_failed',
            errors: e.errors,
          };
        }
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_create_bad_request',
      };
    }
  }

  @MessagePattern('oauth2_login')
  public async oauth2Login(user: IOAuthUser): Promise<IHttpResponse> {
    if (user) {
      let userModel = await this.userService.searchUser({ email: user.email });
      if (userModel && userModel[0]) {
        return {
          status: HttpStatus.OK,
          message: 'user_search_by_credentials_success',
          data: userModel[0],
        };
      } else {
        const newUser = await this.userService.createGoogleUser(user);
        return {
          status: HttpStatus.OK,
          message: 'user_search_by_credentials_success',
          data: newUser,
        };
      }
    } else {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'user_search_by_credentials_not_found',
      };
    }
  }
}
