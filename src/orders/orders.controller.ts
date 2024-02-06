import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CustomExceptionFilter } from '../common/filters/custom-exception.filter';
import { CreateOrderDTO, CreateOrderProductDTO } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { ProductsService } from '../products/products.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentCustomer } from '../common/decorators/current-customer.decorator';
import { ICurrentCustomer } from '../common/interfaces/current-customer.interface';
import { ResponseService } from '../common/services/response.service';
import { EPaymentMethod, OrderDocument } from './entities/order.entity';

const moduleName = 'ORDER';

@ApiTags('orders')
@UseFilters(new CustomExceptionFilter(moduleName))
@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Res() res: Response,
    @Body() body: CreateOrderDTO,
    @CurrentCustomer() customer: ICurrentCustomer,
  ) {
    const { products } = body;
    const { customerId } = customer;

    const detail = await this.ordersService.create(customerId, products);

    const output = ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.CREATED,
      'Suksess',
      { detail },
    );

    return res.status(HttpStatus.CREATED).json(output);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/add-product')
  async addProduct(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: CreateOrderProductDTO,
  ) {
    const { productId } = body;

    await this.ordersService.check(id);
    await this.productsService.check(productId);

    const detail = await this.ordersService.addProduct(id, body);

    const output = ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );

    return res.status(HttpStatus.OK).json(output);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id/checkout')
  async checkout(@Res() res: Response, @Param('id') id: string) {
    const detail = await this.ordersService.checkout(id);

    const output = ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );

    return res.status(HttpStatus.OK).json(output);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id/set-payment')
  async setPayment(@Res() res: Response, @Param('id') id: string) {
    const detail = await this.ordersService.setPayment(
      id,
      EPaymentMethod.BANK_TRANSFER,
    );

    const output = ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );

    return res.status(HttpStatus.OK).json(output);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id/pay')
  async pay(@Res() res: Response, @Param('id') id: string) {
    const detail = await this.ordersService.pay(id);

    const output = ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );

    return res.status(HttpStatus.OK).json(output);
  }
}
