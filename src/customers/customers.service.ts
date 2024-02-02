import { Injectable } from '@nestjs/common';
import { CustomerDocument } from './entities/customer.entity';
import { EntityManager, Repository, IsNull, Not, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IService } from 'src/common/interfaces/service.interface';

@Injectable()
export class CustomersService implements IService<CustomerDocument> {
  constructor(
    @InjectRepository(CustomerDocument)
    private customersRepository: Repository<CustomerDocument>,
  ) {}

  async findById(
    id: string,
    manager: EntityManager,
  ): Promise<CustomerDocument> {
    return manager.findOne(CustomerDocument, {
      where: { id, deleted_at: Not(IsNull()) },
    });
  }

  async findAll(manager: EntityManager): Promise<CustomerDocument[]> {
    return manager.find(CustomerDocument, {
      where: { deleted_at: Not(IsNull()) },
    });
  }

  async deleteMany(ids: string[], manager: EntityManager): Promise<void> {
    await manager
      .createQueryBuilder()
      .update(CustomerDocument)
      .set({ deleted_at: new Date() })
      .where({ id: In(ids) })
      .execute();
  }
}
