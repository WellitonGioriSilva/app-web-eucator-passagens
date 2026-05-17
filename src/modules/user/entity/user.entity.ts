import { Client } from "src/modules/client/entity/client.entity";
import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;
    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @OneToOne(() => Client, client => client.user)
    client!: Client;
}