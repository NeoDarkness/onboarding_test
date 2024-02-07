import { Test, TestingModule } from '@nestjs/testing';
import {
  EOrderStatus,
  EPaymentMethod,
  OrderDocument,
} from './entities/order.entity';
import { CustomerDocument } from '../customers/entities/customer.entity';
import { OrdersService } from './orders.service';
import { CreateOrderDTO, CreateOrderProductDTO } from './dto/create-order.dto';
import { OrdersController } from './orders.controller';
import { PaginationDTO } from '../common/dto/pagination.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  const mockCustomerDocument: CustomerDocument = {
    id: 'mockCustomerId',
    password: 'mock',
    username: 'mock',
    name: 'mock',
    email: 'mock@mock.mock',
    address: 'mock',
    phone: '000000000',
    createdAt: new Date(),
  };

  const mockOrderDocument: OrderDocument = {
    id: 'mockOrderId',
    customer: mockCustomerDocument,
    orderItems: [],
    totalAmount: 0,
    createdAt: new Date(),
    paymentMethod: null,
    status: EOrderStatus.IN_CART,
    name: 'mock',
    email: 'mock@mock.mock',
    address: 'mock',
    phone: '000000000',
  };

  const mockOrdersService = {
    create: jest.fn().mockReturnValue(mockOrderDocument),
    addProduct: jest
      .fn()
      .mockImplementation(
        async (_orderId: string, product: CreateOrderProductDTO) => {
          const { productId, quantity } = product;
          const price = 20000;
          const subtotal = price * quantity;
          mockOrderDocument.orderItems.push({
            id: 'mockOrderItemId',
            product: {
              id: productId,
              name: 'mock',
              description: 'mock',
              price,
              quantity: 10,
              createdAt: new Date(),
            },
            order: mockOrderDocument,
            quantity,
            price,
            subtotal,
            createdAt: new Date(),
          });
          mockOrderDocument.totalAmount = subtotal;

          return mockOrderDocument;
        },
      ),
    checkout: jest.fn().mockImplementation(async () => {
      mockOrderDocument.status = EOrderStatus.CHECKOUT;
      return mockOrderDocument;
    }),
    setPayment: jest
      .fn()
      .mockImplementation(async (_orderId, paymentMethod) => {
        mockOrderDocument.paymentMethod = paymentMethod;
        mockOrderDocument.status = EOrderStatus.WAITING_FOR_PAYMENT;
        return mockOrderDocument;
      }),
    pay: jest.fn().mockImplementation(async () => {
      mockOrderDocument.status = EOrderStatus.COMPLETE;
      return mockOrderDocument;
    }),
    check: jest.fn().mockReturnValue(undefined),
    findOne: jest.fn().mockReturnValue(mockOrderDocument),
    find: jest.fn().mockReturnValue({
      pagination: { size: 10, page: 1, total: 1 },
      content: [mockOrderDocument],
    }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    controller = moduleRef.get<OrdersController>(OrdersController);
  });

  it('get should return correct response object', async () => {
    const result = await controller.get('');
    expect(result).toBeDefined();
    expect(result.response_output.detail).toMatchObject(mockOrderDocument);
  });

  it('list should return correct response object', async () => {
    const result = await controller.list(new PaginationDTO(), {
      customerId: '',
      username: '',
    });
    expect(result).toBeDefined();
    expect(result.response_output.list).toBeDefined();
    expect(result.response_output.list.content).toBeDefined();
    expect(result.response_output.list.pagination).toBeDefined();
  });

  it('create should return correct response object', async () => {
    const result = await controller.create(new CreateOrderDTO(), {
      customerId: 'mockCustomerId',
      username: 'mock',
    });
    expect(result).toBeDefined();
    expect(result.response_output.detail).toMatchObject(mockOrderDocument);
  });

  it('addProduct should return correct response object', async () => {
    const result = await controller.addProduct('mockOrderId', {
      productId: 'mockProductId',
      quantity: 10,
    });
    expect(result).toBeDefined();
    expect(result.response_output.detail.orderItems.length).toBeGreaterThan(0);
    expect(result.response_output.detail.totalAmount).toBeGreaterThan(0);
    expect(result.response_output.detail.status).toBe(EOrderStatus.IN_CART);
  });

  it('checkout should return correct response object', async () => {
    const result = await controller.checkout('mockOrderId');
    expect(result).toBeDefined();
    expect(result.response_output.detail.status).toBe(EOrderStatus.CHECKOUT);
  });

  it('setPayment should return correct response object', async () => {
    const result = await controller.setPayment('mockOrderId', {
      paymentMethod: EPaymentMethod.BANK_TRANSFER,
    });
    expect(result.response_output.detail.status).toBe(
      EOrderStatus.WAITING_FOR_PAYMENT,
    );
    expect(result.response_output.detail.paymentMethod).toBe(
      EPaymentMethod.BANK_TRANSFER,
    );
  });

  it('setPayment should throw error when set paymentMethod other than bank_transfer', async () => {
    let error: Error;
    try {
      await controller.setPayment('mockOrderId', {
        paymentMethod: EPaymentMethod.E_WALLET,
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
  });

  it('pay should set status to be complete', async () => {
    const result = await controller.pay('mockOrderId');
    expect(result.response_output.detail.status).toBe(EOrderStatus.COMPLETE);
  });
});
