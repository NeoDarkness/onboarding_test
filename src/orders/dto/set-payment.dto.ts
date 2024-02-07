import { ApiProperty } from '@nestjs/swagger';
import { EPaymentMethod } from '../entities/order.entity';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class SetPaymentDTO {
  @ApiProperty({ enum: EPaymentMethod })
  @IsNotEmpty()
  @IsEnum(EPaymentMethod)
  paymentMethod: EPaymentMethod;
}
