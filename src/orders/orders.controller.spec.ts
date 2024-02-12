import { Test, TestingModule } from '@nestjs/testing';
import { EOrderStatus, OrderDocument } from './entities/order.entity';
import { CustomerDocument } from '../customers/entities/customer.entity';
import { OrdersService } from './orders.service';
import { CreateOrderDTO } from './dto/create-order.dto';
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

  it('pay should set status to be complete', async () => {
    const result = await controller.pay('mockOrderId');
    expect(result.response_output.detail.status).toBe(EOrderStatus.COMPLETED);
  });
});
