import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrderDocument } from './order.entity';
import { BaseDocument } from '../../common/entities/base.entity';
import { ProductDocument } from '../../products/entities/product.entity';

@Entity({ name: 'order_items' })
export class OrderItemDocument extends BaseDocument {
  @ManyToOne(() => OrderDocument, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderDocument;

  @ManyToOne(() => ProductDocument, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductDocument;

  @Column({ type: 'double precision' })
  price: number;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'double precision' })
  subtotal: number;
}
