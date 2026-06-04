import { Client } from "src/modules/client/entity/client.entity";
import { Payment } from "src/modules/payment/entity/payment.entity";
import { Ticket } from "src/modules/ticket/entity/ticket.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("sales")
export class Sale extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "datetime" })
  dataHora!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  desconto!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subTotal!: number;

  @Column({ type: "varchar", length: 30, default: "pendente" })
  status!: string;

  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: "clientId" })
  client!: Client;

  @OneToMany(() => Ticket, ticket => ticket.sale)
  tickets!: Ticket[];

  @OneToMany(() => Payment, payment => payment.sale)
  payments!: Payment[];
}
