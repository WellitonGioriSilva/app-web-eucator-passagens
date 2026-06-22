import { User } from 'src/modules/user/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('clients')
export class Client extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: 'varchar', length: 255 })
  nome!: string;
  @Column({ type: 'varchar', length: 14, unique: true })
  cpf!: string;
  @Column({ type: 'varchar', length: 15 })
  telefone!: string;
  @Column({ type: 'varchar', length: 8, nullable: true })
  cep?: string | null;
  @Column({ type: 'varchar', length: 150, nullable: true })
  logradouro?: string | null;
  @Column({ type: 'varchar', length: 20, nullable: true })
  numero?: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true })
  complemento?: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true })
  bairro?: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade?: string | null;
  @Column({ type: 'char', length: 2, nullable: true })
  estado?: string | null;
  @Column()
  userId!: number;

  @OneToOne(() => User, (user) => user.client)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
