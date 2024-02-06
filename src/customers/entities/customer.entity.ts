import { BaseDocument } from '../../common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'customers' })
export class CustomerDocument extends BaseDocument {
  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text' })
  address: string;
}
