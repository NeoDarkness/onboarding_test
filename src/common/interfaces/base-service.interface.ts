import {
  DeepPartial,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsWhere,
} from 'typeorm';
import { IResponseList } from './response.interface';

export interface IBaseService<T = unknown> {
  findOne(where: FindOptionsWhere<T>): Promise<T>;

  find(params: {
    page?: number;
    size?: number;
    select?: FindOptionsSelect<T>;
    where?: FindOptionsWhere<T>;
    order?: FindOptionsOrder<T>;
  }): Promise<IResponseList<T>>;

  create(data: DeepPartial<T>): Promise<T>;

  update(params: {
    where: FindOptionsWhere<T>;
    data: DeepPartial<T>;
  }): Promise<T>;
}
