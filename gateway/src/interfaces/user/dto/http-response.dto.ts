import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HttpResponseDto {
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
    type: Object,
  })
  errors?: { [key: string]: any };
}
