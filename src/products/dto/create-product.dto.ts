import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductDTO {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}
