import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductDocument } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  const mockProductDocuments: ProductDocument[] = [
    {
      id: 'mockPrductId',
      name: 'mock',
      description: 'mock',
      price: 100000,
      quantity: 10,
      createdAt: new Date(),
    },
    {
      id: 'mockPrductId2',
      name: 'mock2',
      description: 'mock2',
      price: 200000,
      quantity: 20,
      createdAt: new Date(),
    },
  ];

  const mockProductsService = {
    create: jest.fn().mockReturnValue(mockProductDocuments[0]),
    find: jest.fn().mockReturnValue({
      pagination: { size: 10, total: 2, page: 1 },
      content: mockProductDocuments,
    }),
    findOne: jest.fn().mockReturnValue(mockProductDocuments[0]),
    update: jest.fn().mockReturnValue(undefined),
    delete: jest.fn().mockReturnValue(undefined),
    check: jest.fn().mockReturnValue(undefined),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    service = moduleRef.get<ProductsService>(ProductsService);
  });

  it('create should return product document', async () => {
    const result = await service.create(mockProductDocuments[0]);
    expect(result).toBeDefined();
    expect(result).toMatchObject(mockProductDocuments[0]);
  });

  it('find should has pagination and content property', async () => {
    const result = await service.find({
      page: 1,
      size: 10,
    });
    expect(result.content).toBeDefined();
    expect(result.pagination).toBeDefined();
  });

  it('findOne should return product document', async () => {
    const result = await service.findOne({ id: 'mockProductId' });
    expect(result).toBeDefined();
    expect(result).toMatchObject(mockProductDocuments[0]);
  });

  it('update should not throw error', async () => {
    let error: Error;
    try {
      await service.update({
        where: { id: 'mockProductId' },
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
      await service.delete({ id: 'mockProductId' });
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeDefined();
  });

  it('check should not throw error', async () => {
    let error: Error;
    try {
      await service.check('mockProductId');
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeDefined();
  });
});
