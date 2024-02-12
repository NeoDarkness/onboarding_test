import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { EPaymentMethod } from '../entities/order.entity';

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
  @ApiProperty({ type: [CreateOrderProductDTO] })
  @Type(() => CreateOrderProductDTO)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @IsArray()
  products: CreateOrderProductDTO[];

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

  @ApiProperty({ enum: EPaymentMethod })
  @IsNotEmpty()
  @IsEnum(EPaymentMethod)
  payment_method: EPaymentMethod;
}
