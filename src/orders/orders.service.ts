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
import { CreateOrderProductDTO } from './dto/create-order.dto';
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

  async create(
    consumerId: string,
    products?: CreateOrderProductDTO[],
  ): Promise<OrderDocument> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let totalAmount = 0;

      const order = this.ordersRepository.create({
        customer: {
          id: consumerId,
        },
        totalAmount,
      });

      await queryRunner.manager.save(order);

      // bisa dibuat fuction terpisah untuk check/loop product
      if (products || products.length > 0) {
        const checkAllProducts = await this.productsService.checkStock(
          products,
        );

        // const orderItems: OrderItemDocument[] = [];
        // await queryRunner.manager.save(orderItems);

        await Promise.all(
          checkAllProducts.map(({ productId, quantity, subtotal, price }) => {
            totalAmount += subtotal;
            const orderItem = this.orderItemsRepository.create({
              product: {
                id: productId,
              },
              order: {
                id: order.id,
              },
              price,
              quantity,
              subtotal,
            });

            // bisa pakai bulk insert
            return queryRunner.manager.save(orderItem);
          }),
        );
        order.totalAmount = totalAmount;
      }

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

  async addProduct(
    orderId: string,
    product: CreateOrderProductDTO,
  ): Promise<OrderDocument> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { productId } = product;

      await this.check(orderId);
      await this.productsService.check(productId);

      const order = await this.ordersRepository.findOne({
        where: { id: orderId },
        relations: {
          orderItems: {
            product: true,
          },
        },
      });

      if (order.status !== EOrderStatus.IN_CART) {
        throw new BadRequestException('Unable to add product.');
      }

      const exists = order.orderItems.find((e) => e.product.id === productId);
      if (exists) {
        product.quantity += exists.quantity;
        order.totalAmount -= exists.subtotal;
      }

      const [{ subtotal, quantity, price }] =
        await this.productsService.checkStock([product]);

      // exists ini setelah diisi ulang valuenya lalu diapakan ya?
      // kalau gak direturn atau disave lebih baik tidak usah diolah
      if (exists) {
        exists.price = price;
        exists.quantity = quantity;
        exists.subtotal = subtotal;
      } else {
        const orderItem = this.orderItemsRepository.create({
          product: {
            id: productId,
          },
          order: {
            id: orderId,
          },
          price,
          quantity,
          subtotal,
        });

        order.orderItems.push(orderItem);
      }

      order.totalAmount += subtotal;

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

  async checkout(orderId: string): Promise<OrderDocument> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.check(orderId);

      const order = await this.ordersRepository.findOne({
        where: { id: orderId },
        relations: {
          orderItems: {
            product: true,
          },
        },
      });
      const { orderItems } = order;

      if (order.status !== EOrderStatus.IN_CART || orderItems.length === 0) {
        throw new BadRequestException('Unable to checkout.');
      }

      const products = orderItems.map(
        ({ product: { id: productId }, quantity }) => ({
          productId,
          quantity,
        }),
      );

      await this.productsService.checkStock(products);

      await Promise.all(
        orderItems.map((orderItem) => {
          orderItem.product.quantity -= orderItem.quantity;
          return queryRunner.manager.save(orderItem.product);
        }),
      );

      order.status = EOrderStatus.CHECKOUT;

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

  async setPayment(
    orderId: string,
    paymentMethod: EPaymentMethod,
  ): Promise<OrderDocument> {
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

    if (order.status !== EOrderStatus.CHECKOUT) {
      throw new BadRequestException('Unable to select payment.');
    }

    order.paymentMethod = paymentMethod;
    order.status = EOrderStatus.WAITING_FOR_PAYMENT;

    return this.ordersRepository.save(order);
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

    order.status = EOrderStatus.COMPLETE;

    return this.ordersRepository.save(order);
  }
}
