import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  nome!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
