import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CustomExceptionFilter } from '../common/filters/custom-exception.filter';
import { CreateOrderDTO, CreateOrderProductDTO } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentCustomer } from '../common/decorators/current-customer.decorator';
import { ICurrentCustomer } from '../common/interfaces/current-customer.interface';
import { ResponseService } from '../common/services/response.service';
import { EPaymentMethod, OrderDocument } from './entities/order.entity';
import { JwtAuth } from '../common/decorators/jwt-auth.decorator';
import { PaginationDTO } from '../common/dto/pagination.dto';
import { SetPaymentDTO } from './dto/set-payment.dto';

const moduleName = 'ORDER';

@ApiTags('orders')
@UseFilters(new CustomExceptionFilter(moduleName))
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @JwtAuth
  @Get()
  async list(
    @Query() query: PaginationDTO,
    @CurrentCustomer() customer: ICurrentCustomer,
  ) {
    const { size, page } = query;
    const { customerId } = customer;

    const list = await this.ordersService.find({
      page,
      size,
      where: {
        customer: {
          id: customerId,
        },
      },
    });

    return ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { list },
    );
  }

  @JwtAuth
  @Get(':id')
  async get(@Param('id') id: string) {
    const detail = await this.ordersService.findOne({
      id,
    });

    return ResponseService.responseBuilder<OrderDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );
  }

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
  async setPayment(@Param('id') id: string, @Body() body: SetPaymentDTO) {
    const { paymentMethod } = body;

    if (paymentMethod !== EPaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException('Only bank transfer payments are accepted');
    }

    const detail = await this.ordersService.setPayment(id, paymentMethod);

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
