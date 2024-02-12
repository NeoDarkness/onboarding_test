import { CustomerDocument } from '../../customers/entities/customer.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderItemDocument } from './order-item.entity';
import { BaseDocument } from '../../common/entities/base.entity';

export enum EOrderStatus {
  WAITING_FOR_PAYMENT = 'waiting_for_payment',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum EPaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
}

@Entity({ name: 'orders' })
export class OrderDocument extends BaseDocument {
  @ManyToOne(() => CustomerDocument, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerDocument;

  @Column({ name: 'total_amount', type: 'double precision' })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: EOrderStatus,
    default: EOrderStatus.WAITING_FOR_PAYMENT,
  })
  status: EOrderStatus;

  @Column({
    type: 'enum',
    enum: EPaymentMethod,
  })
  paymentMethod: EPaymentMethod;

  @OneToMany(() => OrderItemDocument, (orderItem) => orderItem.order, {
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  orderItems: OrderItemDocument[];

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text' })
  address: string;
}
