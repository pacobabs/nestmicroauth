import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    uniqueItems: true,
    example: 'test@example.com',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    minLength: 6,
    example: 'test11',
  })
  @MinLength(6)
  password: string;
}
