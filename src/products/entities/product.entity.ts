import { BaseDocument } from '../../common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'products' })
export class ProductDocument extends BaseDocument {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'double precision' })
  price: number;
}
