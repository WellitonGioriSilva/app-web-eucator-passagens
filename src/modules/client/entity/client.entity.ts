import { User } from "src/modules/user/entity/user.entity";
import { BaseEntity, Column, Entity, ForeignKey, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('clients')
export class Client extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column({ type: 'varchar', length: 255})
    nome!: string;
    @Column({ type: 'varchar', length: 14, unique: true })
    cpf!: string;
    @Column({ type: 'varchar', length: 15 })
    telefone!: string;
    @ForeignKey(() => User)
    @Column()
    userId!: number;

    @OneToOne(() => User, user => user.client)
    user!: User;
}