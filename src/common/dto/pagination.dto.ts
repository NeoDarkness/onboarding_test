import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class PaginationDTO {
  @ApiProperty({ default: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ default: 10 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  size: number;
}
