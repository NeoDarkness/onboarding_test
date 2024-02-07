import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductDocument } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { CreateProductDTO } from './dto/create-product.dto';
import { ListProductDTO } from './dto/list-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
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
    update: jest.fn().mockImplementation((params) => {
      const { data } = params;
      const product = mockProductDocuments[0];
      for (const [key, value] of Object.entries(data)) {
        product[key] = value;
      }
      return product;
    }),
    check: jest.fn().mockReturnValue(undefined),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    controller = moduleRef.get<ProductsController>(ProductsController);
  });

  it('create should return correct response object', async () => {
    const result = await controller.create(new CreateProductDTO());
    expect(result).toBeDefined();
    expect(result.response_output.detail).toMatchObject(
      mockProductDocuments[0],
    );
  });

  it('get should return correct response object', async () => {
    const result = await controller.get('');
    expect(result).toBeDefined();
    expect(result.response_output.detail).toMatchObject(
      mockProductDocuments[0],
    );
  });

  it('list should return correct response object', async () => {
    const result = await controller.list(new ListProductDTO());
    expect(result).toBeDefined();
    expect(result.response_output.list).toBeDefined();
    expect(result.response_output.list.content).toBeDefined();
    expect(result.response_output.list.pagination).toBeDefined();
  });

  it('update should return correct response object', async () => {
    const result = await controller.update('', new UpdateProductDTO());
    expect(result).toBeDefined();
    expect(result.response_output.detail).toBeDefined();
  });
});
