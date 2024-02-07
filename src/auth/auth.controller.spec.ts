import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CustomerDocument } from '../customers/entities/customer.entity';
import { AuthController } from './auth.controller';
import { LoginDTO } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
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
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
  });

  it('login should return correct response object', async () => {
    const result = await controller.login(new LoginDTO(), mockCustomerDocument);
    expect(result).toBeDefined();
    expect(result.response_schema).toBeDefined();
    expect(result.response_output.detail.customer).toBeDefined();
    expect(result.response_output.detail.accessToken).toBe('token');
    expect(result.response_output.detail.refreshToken).toBe('refreshToken');
  });
});
