import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'updatedt_at', nullable: true })
  updatedAt?: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
