import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerDocument } from './customers/entities/customer.entity';
import { ProductDocument } from './products/entities/product.entity';
import { OrdersModule } from './orders/orders.module';
import { OrderDocument } from './orders/entities/order.entity';
import { OrderItemDocument } from './orders/entities/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CommonModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        url: configService.get('DATABASE_URL'),
        entities: [
          CustomerDocument,
          ProductDocument,
          OrderDocument,
          OrderItemDocument,
        ],
        synchronize: true,
      }),
    }),
    ProductsModule,
    CustomersModule,
    AuthModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
