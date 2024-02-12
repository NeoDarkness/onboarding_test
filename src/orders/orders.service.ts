import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EOrderStatus,
  EPaymentMethod,
  OrderDocument,
} from './entities/order.entity';
import {
  DataSource,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { OrderItemDocument } from './entities/order-item.entity';
import { CreateOrderDTO, CreateOrderProductDTO } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import {
  IResponseList,
  IResponsePagination,
} from '../common/interfaces/response.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderDocument)
    private ordersRepository: Repository<OrderDocument>,
    @InjectRepository(OrderItemDocument)
    private orderItemsRepository: Repository<OrderItemDocument>,
    private productsService: ProductsService,
    private dataSource: DataSource,
  ) {}

  async check(id: string): Promise<void> {
    const exists = await this.ordersRepository.exists({ where: { id } });
    if (!exists)
      throw new NotFoundException(`Order with id '${id}' does not exists.`);
  }

  async find(params: {
    page?: number;
    size?: number;
    select?: FindOptionsSelect<OrderDocument>;
    where?: FindOptionsWhere<OrderDocument>;
    order?: FindOptionsOrder<OrderDocument>;
  }): Promise<IResponseList<OrderDocument>> {
    const { page = 1, size = 10, select, where, order } = params;

    const skip = (page - 1) * size;

    const [content, total] = await this.ordersRepository.findAndCount({
      skip,
      take: size,
      where,
      order,
      select,
      relations: {
        customer: true,
        orderItems: {
          product: true,
        },
      },
    });

    const pagination: IResponsePagination = {
      total,
      size,
      page,
    };

    return { pagination, content };
  }

  async findOne(
    where?: FindOptionsWhere<OrderDocument>,
  ): Promise<OrderDocument | null> {
    return this.ordersRepository.findOne({
      where,
      relations: {
        customer: true,
        orderItems: {
          product: true,
        },
      },
    });
  }

  async addOrderItems(
    order: OrderDocument,
    products: CreateOrderProductDTO[],
  ): Promise<void> {
    order.orderItems ??= [];

    const orderItemMap = Object.fromEntries(
      order.orderItems.map((orderItem) => [orderItem.product.id, orderItem]),
    );

    const mergeProducts = products.map(({ productId, quantity }) => {
      const oldQuantity = orderItemMap[productId]?.quantity ?? 0;
      return { productId, quantity: oldQuantity + quantity };
    });

    const checkAllProducts = await this.productsService.checkStock(
      mergeProducts,
    );

    checkAllProducts.forEach(
      ({ productId, quantity, stock, subtotal, price }) => {
        const exists = orderItemMap[productId];
        if (exists) {
          const diffQuantity = quantity - exists.quantity;
          exists.product.quantity -= diffQuantity;
          exists.quantity = quantity;
          exists.price = price;
          exists.subtotal = subtotal;
        } else {
          const orderItem = this.orderItemsRepository.create({
            product: {
              id: productId,
              quantity: stock - quantity,
            },
            order: {
              id: order.id,
            },
            price,
            quantity,
            subtotal,
          });

          order.orderItems.push(orderItem);
        }
      },
    );

    order.totalAmount = order.orderItems.reduce((p, c) => p + c.subtotal, 0);
  }

  async create(
    consumerId: string,
    data: CreateOrderDTO,
  ): Promise<OrderDocument> {
    const { products, name, email, phone, address, paymentMethod } = data;

    if (paymentMethod !== EPaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException('Only bank transfer payments are accepted');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = this.ordersRepository.create({
        name,
        email,
        phone,
        address,
        paymentMethod,
        customer: {
          id: consumerId,
        },
        totalAmount: 0,
      });

      await queryRunner.manager.save(order);

      await this.addOrderItems(order, products);

      const { id } = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return this.ordersRepository.findOne({
        where: { id },
        relations: {
          customer: true,
          orderItems: {
            product: true,
          },
        },
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async pay(orderId: string): Promise<OrderDocument> {
    await this.check(orderId);

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: {
        customer: true,
        orderItems: {
          product: true,
        },
      },
    });

    if (order.status !== EOrderStatus.WAITING_FOR_PAYMENT) {
      throw new BadRequestException('Unable to pay.');
    }

    order.status = EOrderStatus.COMPLETED;

    return this.ordersRepository.save(order);
  }
}
