import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CustomExceptionFilter } from '../common/filters/custom-exception.filter';
import { CreateOrderDTO, CreateOrderProductDTO } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { ProductsService } from '../products/products.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentCustomer } from '../common/decorators/current-customer.decorator';
import { ICurrentCustomer } from '../common/interfaces/current-customer.interface';
import { ResponseService } from '../common/services/response.service';
import { EPaymentMethod, OrderDocument } from './entities/order.entity';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';

const moduleName = 'ORDER';

@ApiTags('orders')
@UseFilters(new CustomExceptionFilter(moduleName))
@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {}

  @JwtAuth
  @Post()
  async create(
    @Body() body: CreateOrderDTO,
    @CurrentCustomer() customer: ICurrentCustomer,
  ) {
    const { products } = body;
    const { customerId } = customer;

    const detail = await this.ordersService.create(customerId, products);

    return ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.CREATED,
      'Suksess',
      { detail },
    );
  }

  @JwtAuth
  @Post(':id/add-product')
  async addProduct(
    @Param('id') id: string,
    @Body() body: CreateOrderProductDTO,
  ) {
    const { productId } = body;

    await this.ordersService.check(id);
    await this.productsService.check(productId);

    const detail = await this.ordersService.addProduct(id, body);

    return ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.CREATED,
      'Suksess',
      { detail },
    );
  }

  @JwtAuth
  @Put(':id/checkout')
  async checkout(@Param('id') id: string) {
    const detail = await this.ordersService.checkout(id);

    return ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );
  }

  @JwtAuth
  @Put(':id/set-payment')
  async setPayment(@Param('id') id: string) {
    const detail = await this.ordersService.setPayment(
      id,
      EPaymentMethod.BANK_TRANSFER,
    );

    return ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id/pay')
  async pay(@Param('id') id: string) {
    const detail = await this.ordersService.pay(id);

    return ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );
  }
}
