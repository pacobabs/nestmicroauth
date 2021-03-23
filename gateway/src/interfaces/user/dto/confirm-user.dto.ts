import { IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmUserDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: '1234' })
  @Length(6, 6)
  code: string;
}
