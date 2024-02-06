import { CustomerDocument } from '../../customers/entities/customer.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderItemDocument } from './order-item.entity';
import { BaseDocument } from '../../common/entities/base.entity';

export enum EOrderStatus {
  IN_CART = 'in_cart',
  CHECKOUT = 'checkout',
  WAITING_FOR_PAYMENT = 'waiting_for_payment',
  COMPLETE = 'complete',
  FAILED = 'failed',
}

export enum EPaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
}

@Entity({ name: 'orders' })
export class OrderDocument extends BaseDocument {
  @ManyToOne(() => CustomerDocument, {
    cascade: true,
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
    default: EOrderStatus.IN_CART,
  })
  status: EOrderStatus;

  @Column({
    type: 'enum',
    enum: EPaymentMethod,
    nullable: true,
  })
  paymentMethod?: EPaymentMethod;

  @OneToMany(() => OrderItemDocument, (orderItem) => orderItem.order, {
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  orderItems: OrderItemDocument[];
}
