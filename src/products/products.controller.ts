import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ResponseService } from '../common/services/response.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateProductDTO } from './dto/create-product.dto';
import { ListProductDTO } from './dto/list-product.dto';
import { CustomExceptionFilter } from '../common/filters/custom-exception.filter';
import { ProductDocument } from './entities/product.entity';
import { FindOptionsWhere, ILike } from 'typeorm';
import { UpdateProductDTO } from './dto/update-product.dto';

const moduleName = 'PRODUCT';

@ApiTags('products')
@UseFilters(new CustomExceptionFilter(moduleName))
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    await this.productsService.check(id);
    const detail = await this.productsService.findOne({ id });

    return ResponseService.responseBuilder<ProductDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );
  }

  @Get()
  async list(@Query() query: ListProductDTO) {
    const { page, size, name } = query;

    const where: FindOptionsWhere<ProductDocument> = {};
    if (name) {
      where.name = ILike(`%${name}%`);
    }

    const list = await this.productsService.find({
      page,
      size,
      where,
    });

    return ResponseService.responseBuilder(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { list },
    );
  }

  @Post()
  async create(@Body() body: CreateProductDTO) {
    const detail = await this.productsService.create(body);

    return ResponseService.responseBuilder(
      moduleName,
      HttpStatus.CREATED,
      'Suksess',
      { detail },
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProductDTO) {
    await this.productsService.check(id);
    const detail = await this.productsService.update({
      where: { id },
      data: body,
    });

    return ResponseService.responseBuilder(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );
  }
}
