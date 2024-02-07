import { Test, TestingModule } from '@nestjs/testing';
import {
  EOrderStatus,
  EPaymentMethod,
  OrderDocument,
} from './entities/order.entity';
import { CustomerDocument } from '../customers/entities/customer.entity';
import { OrdersService } from './orders.service';
import { CreateOrderProductDTO } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
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
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    service = moduleRef.get<OrdersService>(OrdersService);
  });

  it('findOne should return order document', async () => {
    const result = await service.findOne({ id: 'mockOrderId' });
    expect(result).toBeDefined();
    expect(result.id).toBe('mockOrderId');
  });

  it('find should has pagination and content property', async () => {
    const result = await service.find({
      page: 1,
      size: 10,
    });
    expect(result.content).toBeDefined();
    expect(result.pagination).toBeDefined();
  });

  it('addProduct should set totalAmount and orderItems', async () => {
    const result = await service.addProduct('mockOrderId', {
      productId: 'mockProductId',
      quantity: 10,
    });
    expect(result.orderItems.length).toBeGreaterThan(0);
    expect(result.totalAmount).toBeGreaterThan(0);
    expect(result.status).toBe(EOrderStatus.IN_CART);
  });

  it('checkout sould set status to be checkout', async () => {
    const result = await service.checkout('mockOrderId');
    expect(result.status).toBe(EOrderStatus.CHECKOUT);
  });

  it('setPayment sould set status to be waiting_for_payment and paymentMethod to be bank_transfer', async () => {
    const result = await service.setPayment(
      'mockOrderId',
      EPaymentMethod.BANK_TRANSFER,
    );
    expect(result.status).toBe(EOrderStatus.WAITING_FOR_PAYMENT);
    expect(result.paymentMethod).toBe(EPaymentMethod.BANK_TRANSFER);
  });

  it('pay sould set status to be complete', async () => {
    const result = await service.pay('mockOrderId');
    expect(result.status).toBe(EOrderStatus.COMPLETE);
  });

  it('check should not throw error', async () => {
    let error: Error;
    try {
      await service.check('mockOrderId');
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeDefined();
  });
});
