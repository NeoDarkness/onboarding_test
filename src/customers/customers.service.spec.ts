import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { CustomerDocument } from './entities/customer.entity';
import { DeepPartial } from 'typeorm';

describe('CustomersService', () => {
  let service: CustomersService;
  const mockCustomerDocuments: DeepPartial<CustomerDocument>[] = [
    {
      id: 'mockCustomerId',
      password: 'mock',
      username: 'mock',
      name: 'mock',
      email: 'mock@mock.mock',
      address: 'mock',
      phone: '000000000',
      createdAt: new Date(),
    },
    {
      id: 'mockCustomerId2',
      password: 'mock2',
      username: 'mock2',
      name: 'mock2',
      email: 'mock2@mock2.mock2',
      address: 'mock2',
      phone: '222222222',
      createdAt: new Date(),
    },
  ];

  const mockCustomersService = {
    create: jest.fn().mockReturnValue(mockCustomerDocuments[0]),
    find: jest.fn().mockReturnValue({
      pagination: { size: 10, total: 2, page: 1 },
      content: mockCustomerDocuments,
    }),
    findOne: jest.fn().mockReturnValue(mockCustomerDocuments[0]),
    update: jest.fn().mockReturnValue(undefined),
    delete: jest.fn().mockReturnValue(undefined),
    check: jest.fn().mockReturnValue(undefined),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CustomersService, useValue: mockCustomersService },
      ],
    }).compile();

    service = moduleRef.get<CustomersService>(CustomersService);
  });

  it('create should return customer document', async () => {
    const result = await service.create(mockCustomerDocuments[0]);
    expect(result).toBeDefined();
    expect(result).toMatchObject(mockCustomerDocuments[0]);
  });

  it('find should has pagination and content property', async () => {
    const result = await service.find({
      page: 1,
      size: 10,
    });
    expect(result.content).toBeDefined();
    expect(result.pagination).toBeDefined();
  });

  it('findOne should return customer document', async () => {
    const result = await service.findOne({ id: 'mockCustomerId' });
    expect(result).toBeDefined();
    expect(result).toMatchObject(mockCustomerDocuments[0]);
  });

  it('update should not throw error', async () => {
    let error: Error;
    try {
      await service.update({
        where: { id: 'mockCustomerId' },
        data: { name: 'updatedName' },
      });
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeDefined();
  });

  it('delete should not throw error', async () => {
    let error: Error;
    try {
      await service.delete({ id: 'mockCustomerId' });
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeDefined();
  });

  it('check should not throw error', async () => {
    let error: Error;
    try {
      await service.check('mockCustomerId');
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeDefined();
  });
});
