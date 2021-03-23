import { Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetSubmitDto {
  @ApiProperty({ example: '123456' })
  @Length(6, 6)
  code: string;
  @ApiProperty({ example: 'test@example.com' })
  @MinLength(6)
  password: string;
}
