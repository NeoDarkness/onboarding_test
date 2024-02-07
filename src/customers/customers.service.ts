import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import {
  IResponseList,
  IResponsePagination,
} from '../common/interfaces/response.interface';
import { IBaseService } from '../common/interfaces/base-service.interface';
import { CustomerDocument } from './entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { hashPassword } from '../common/utils/password.util';
import * as _ from 'lodash';

@Injectable()
export class CustomersService
  implements IBaseService<CustomerDocument>, OnModuleInit
{
  constructor(
    @InjectRepository(CustomerDocument)
    private customersRepository: Repository<CustomerDocument>,
  ) {}

  async onModuleInit() {
    const customers = {
      user1: {
        password: hashPassword('123456'),
        username: 'user1',
        name: 'user1',
        email: 'user1@user1.user1',
        address: 'user1',
        phone: '11111111111',
        createdAt: new Date(),
      },
      user2: {
        password: hashPassword('123456'),
        username: 'user2',
        name: 'user2',
        email: 'user2@user2.user2',
        address: 'user2',
        phone: '22222222222',
        createdAt: new Date(),
      },
    };

    const usernames = Object.keys(customers);

    const exists = await this.customersRepository.find({
      where: { username: In(usernames) },
      select: {
        username: true,
      },
    });

    const existsList = exists.map(({ username }) => username);

    const diff = _.difference(usernames, existsList);

    if (diff.length > 0) {
      await this.customersRepository.save(
        diff.map((username) => customers[username]),
      );
    }
  }

  async check(id: string): Promise<void> {
    const exists = await this.customersRepository.exists({ where: { id } });
    if (!exists)
      throw new NotFoundException(`Product with id '${id}' does not exists.`);
  }

  async find(params: {
    page?: number;
    size?: number;
    select?: FindOptionsSelect<CustomerDocument>;
    where?: FindOptionsWhere<CustomerDocument>;
    order?: FindOptionsOrder<CustomerDocument>;
  }): Promise<IResponseList<CustomerDocument>> {
    const { page = 1, size = 10, where, order } = params;

    const skip = (page - 1) * size;

    const [content, total] = await this.customersRepository.findAndCount({
      skip,
      take: size,
      where,
      order,
    });

    const pagination: IResponsePagination = {
      total,
      size,
      page,
    };

    return { pagination, content };
  }

  async findOne(
    where?: FindOptionsWhere<CustomerDocument>,
  ): Promise<CustomerDocument | null> {
    return this.customersRepository.findOne({ where });
  }

  async create(data: DeepPartial<CustomerDocument>): Promise<CustomerDocument> {
    return this.customersRepository.save(data);
  }

  async update(params: {
    where: FindOptionsWhere<CustomerDocument>;
    data: DeepPartial<CustomerDocument>;
  }): Promise<void> {
    const { where, data } = params;
    await this.customersRepository.update(where, data);
  }

  async delete(where: FindOptionsWhere<CustomerDocument>): Promise<void> {
    await this.customersRepository.delete(where);
  }
}
