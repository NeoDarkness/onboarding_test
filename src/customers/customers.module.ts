import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { Module } from '@nestjs/common';
import { CustomerDocument } from './entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerDocument])],
  controllers: [],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
