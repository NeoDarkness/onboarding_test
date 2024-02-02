import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated_at?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;
}
