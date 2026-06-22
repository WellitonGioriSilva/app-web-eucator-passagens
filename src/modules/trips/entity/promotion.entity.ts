import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trip } from './trip.entity';

@Entity('promotions')
export class Promotion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nome!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentualDesconto!: number;

  @Column({ type: 'datetime' })
  dataInicio!: Date;

  @Column({ type: 'datetime' })
  dataFim!: Date;

  @Column({ type: 'boolean', default: true })
  ativa!: boolean;

  @ManyToOne(() => Trip, (trip) => trip.promotions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip!: Trip;
}
