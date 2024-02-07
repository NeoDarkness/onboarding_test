import { Injectable, NotFoundException } from '@nestjs/common';
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
  Repository,
} from 'typeorm';

@Injectable()
export class CustomersService implements IBaseService<CustomerDocument> {
  constructor(
    @InjectRepository(CustomerDocument)
    private customersRepository: Repository<CustomerDocument>,
  ) {}

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
  }): Promise<CustomerDocument> {
    const { where, data } = params;

    const { raw } = await this.customersRepository.update(where, data);
    return raw;
  }
}
