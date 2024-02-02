import { EntityManager } from 'typeorm';
import { BaseDocument } from '../entities/base.entity';

export interface IService<T extends BaseDocument> {
  findById(id: string, manager?: EntityManager): Promise<T>;

  findAll(manager: EntityManager): Promise<T[]>;

  deleteMany(ids: string[], manager: EntityManager): Promise<void>;
}
