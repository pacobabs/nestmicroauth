import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUser } from '../user.interface';

export class UserTokenResponseDto {
  @ApiProperty({
    default: 200,
    type: Number,
  })
  status: HttpStatus;
  @ApiProperty({
    type: String,
  })
  message: string;
  @ApiPropertyOptional({
    example: {
      user: {
        email: 'test@example.com',
        is_confirmed: false,
        id: '5d987c3bfb881ec86b476bcc',
        token: '8cfe589009jt5658cnfc',
      },
    },
    type: Object,
  })
  data?: IUser;
  @ApiPropertyOptional({
    type: Object,
  })
  errors?: { [key: string]: any };
}
