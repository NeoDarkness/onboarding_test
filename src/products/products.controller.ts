import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseFilters,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ResponseService } from '../common/services/response.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CreateProductDTO } from './dto/create-product.dto';
import { ListProductDTO } from './dto/list-product.dto';
import { CustomExceptionFilter } from '../common/filters/custom-exception.filter';
import { ProductDocument } from './entities/product.entity';
import { FindOptionsWhere, ILike } from 'typeorm';

const moduleName = 'PRODUCT';

@ApiTags('products')
@UseFilters(new CustomExceptionFilter(moduleName))
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get(':id')
  async get(@Res() res: Response, @Param('id') id: string) {
    await this.productsService.check(id);
    const detail = await this.productsService.findOne({ id });

    const output = ResponseService.responseBuilder<ProductDocument>(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );

    return res.status(HttpStatus.OK).json(output);
  }

  @Get()
  async list(@Res() res: Response, @Query() query: ListProductDTO) {
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

    const output = ResponseService.responseBuilder(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { list },
    );

    return res.status(HttpStatus.OK).json(output);
  }

  @Post()
  async create(@Res() res: Response, @Body() body: CreateProductDTO) {
    const detail = await this.productsService.create(body);

    const output = ResponseService.responseBuilder(
      moduleName,
      HttpStatus.CREATED,
      'Suksess',
      { detail },
    );

    return res.status(HttpStatus.CREATED).json(output);
  }

  @Put(':id')
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: CreateProductDTO,
  ) {
    await this.productsService.check(id);
    const detail = await this.productsService.update({
      where: { id },
      data: body,
    });

    const output = ResponseService.responseBuilder(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );

    return res.status(HttpStatus.OK).json(output);
  }
}
