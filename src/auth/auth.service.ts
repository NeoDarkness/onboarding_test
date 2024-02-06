import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import { CustomerDocument } from '../customers/entities/customer.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private customersService: CustomersService,
    private jwtService: JwtService,
  ) {}

  async validateCustomer(
    username: string,
    password: string,
  ): Promise<Omit<CustomerDocument, 'password'> | null> {
    const customer = await this.customersService.findOne({ username });
    if (customer && bcrypt.compareSync(password, customer.password)) {
      customer.password = undefined;
      return customer;
    }
    return null;
  }

  login(customer: Omit<CustomerDocument, 'password'>): {
    customer: Omit<CustomerDocument, 'password'>;
    accessToken: string;
    refreshToken: string;
  } {
    return {
      customer,
      accessToken: this.jwtService.sign(
        { sub: customer.id, username: customer.username },
        { expiresIn: '1h' },
      ),
      refreshToken: this.jwtService.sign(
        { sub: customer.id, username: customer.username },
        {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_SECRET,
        },
      ),
    };
  }
}
