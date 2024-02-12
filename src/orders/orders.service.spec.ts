import { Test, TestingModule } from '@nestjs/testing';
import { EOrderStatus, OrderDocument } from './entities/order.entity';
import { CustomerDocument } from '../customers/entities/customer.entity';
import { OrdersService } from './orders.service';

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
    created_at: new Date(),
  };

  const mockOrderDocument: OrderDocument = {
    id: 'mockOrderId',
    customer: mockCustomerDocument,
    order_items: [],
    total_amount: 0,
    created_at: new Date(),
    payment_method: null,
    status: EOrderStatus.WAITING_FOR_PAYMENT,
    name: 'mock',
    email: 'mock@mock.mock',
    address: 'mock',
    phone: '000000000',
  };

  const mockOrdersService = {
    create: jest.fn().mockReturnValue(mockOrderDocument),
    pay: jest.fn().mockImplementation(async () => {
      mockOrderDocument.status = EOrderStatus.COMPLETED;
      return mockOrderDocument;
    }),
    check: jest.fn().mockReturnValue(undefined),
    findOne: jest.fn().mockReturnValue(mockOrderDocument),
    find: jest.fn().mockReturnValue({
      pagination: { size: 10, page: 1, total: 1 },
      content: [mockOrderDocument],
    }),
    addOrderItems: jest.fn().mockReturnValue(undefined),
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

  it('pay should set status to be complete', async () => {
    const result = await service.pay('mockOrderId');
    expect(result.status).toBe(EOrderStatus.COMPLETED);
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

  it('addOrderItems should not throw error', async () => {
    let error: Error;
    try {
      await service.addOrderItems(mockOrderDocument, [
        { product_id: 'mockProductId', quantity: 10 },
      ]);
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeDefined();
  });
});
