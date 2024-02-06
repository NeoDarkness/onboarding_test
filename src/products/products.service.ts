import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IResponseList,
  IResponsePagination,
} from '../common/interfaces/response.interface';
import { ProductDocument } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
  FindOptionsSelect,
  In,
} from 'typeorm';
import { IService } from '../common/interfaces/service.interface';
import { ICheckStockResult } from './interfaces/check-stock.interface';
import { ECheckStockStatus } from './enums/check-stock.enum';

@Injectable()
export class ProductsService implements IService<ProductDocument> {
  constructor(
    @InjectRepository(ProductDocument)
    private productsRepository: Repository<ProductDocument>,
  ) {}

  async check(id: string): Promise<void> {
    const exists = await this.productsRepository.exists({ where: { id } });
    if (!exists)
      throw new NotFoundException(`Product with id '${id}' does not exists.`);
  }

  async checkStock(
    products: { productId: string; quantity: number }[],
  ): Promise<ICheckStockResult[]> {
    const productIds = products.map(({ productId }) => productId);

    const check = await this.productsRepository.find({
      where: {
        id: In(productIds),
      },
      select: {
        id: true,
        quantity: true,
        price: true,
      },
    });

    const checkMap = Object.fromEntries(
      check.map(({ id, ...rest }) => [id, rest]),
    );

    const checkAllProducts = products.map(({ productId, quantity }) => {
      const checkData = checkMap[productId];
      const status = !checkData
        ? ECheckStockStatus.NOT_EXIST
        : quantity > checkData.quantity
        ? ECheckStockStatus.OUT_OF_STOCK
        : ECheckStockStatus.OK;
      const { price = 0, quantity: stock = 0 } = checkData ?? {};
      const subtotal = price * quantity;

      return { productId, quantity, price, subtotal, status, stock };
    });

    const unavailableProducts = checkAllProducts.filter(
      ({ status }) => status !== ECheckStockStatus.OK,
    );

    if (unavailableProducts.length > 0) {
      throw new BadRequestException(
        'Some products may currently be unavailable. Please check product availability or try again later.',
        {
          cause: unavailableProducts.map(({ productId, status }) => ({
            field: productId,
            message:
              status === ECheckStockStatus.OUT_OF_STOCK
                ? 'Product out of stock or insufficient.'
                : 'Product does not exists.',
          })),
        },
      );
    }

    return checkAllProducts;
  }

  async find(params: {
    page?: number;
    size?: number;
    select?: FindOptionsSelect<ProductDocument>;
    where?: FindOptionsWhere<ProductDocument>;
    order?: FindOptionsOrder<ProductDocument>;
  }): Promise<IResponseList<ProductDocument>> {
    const { page = 1, size = 10, select, where, order } = params;

    const skip = (page - 1) * size;

    const [content, total] = await this.productsRepository.findAndCount({
      skip,
      take: size,
      where,
      order,
      select,
    });

    const pagination: IResponsePagination = {
      total,
      size,
      page,
    };

    return { pagination, content };
  }

  async findOne(
    where?: FindOptionsWhere<ProductDocument>,
  ): Promise<ProductDocument | null> {
    return this.productsRepository.findOne({ where });
  }

  async create(data: DeepPartial<ProductDocument>): Promise<ProductDocument> {
    return this.productsRepository.save(data);
  }

  async update(params: {
    where: FindOptionsWhere<ProductDocument>;
    data: DeepPartial<ProductDocument>;
  }): Promise<ProductDocument> {
    const { where, data } = params;

    const { raw } = await this.productsRepository.update(where, data);
    return raw;
  }
}