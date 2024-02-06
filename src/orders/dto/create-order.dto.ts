import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderProductDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDTO {
  @ApiPropertyOptional()
  @Type(() => CreateOrderProductDTO)
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  products?: CreateOrderProductDTO[];
}
