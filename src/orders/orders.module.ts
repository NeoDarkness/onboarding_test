import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsModule } from '../products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDocument } from './entities/order.entity';
import { OrderItemDocument } from './entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderDocument, OrderItemDocument]),
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
