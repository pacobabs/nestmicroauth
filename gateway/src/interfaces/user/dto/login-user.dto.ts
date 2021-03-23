import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;
  @ApiProperty({
    minLength: 6,
    example: 'test11',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
