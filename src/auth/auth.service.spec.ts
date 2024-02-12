import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CustomerDocument } from '../customers/entities/customer.entity';

describe('AuthService', () => {
  let service: AuthService;
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

  const mockAuthService = {
    validateCustomer: jest.fn().mockReturnValue(mockCustomerDocument),
    getLoginData: jest.fn().mockReturnValue({
      customer: mockCustomerDocument,
      accessToken: 'token',
      refreshToken: 'refreshToken',
    }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('validateCustomer should return customer document', async () => {
    const result = await service.validateCustomer('mock', 'mock');
    expect(result).toBeDefined();
    expect(result).toMatchObject(mockCustomerDocument);
  });

  it('getLoginData should has customer, accessToken and refreshToken property', () => {
    const result = service.getLoginData(mockCustomerDocument);
    expect(result.customer).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('refreshToken');
  });
});
