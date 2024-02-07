import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
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

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  address: string;
}
