import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: '8cfe589009jt5658cnfc' })
  @IsNotEmpty()
  token: string;
}
