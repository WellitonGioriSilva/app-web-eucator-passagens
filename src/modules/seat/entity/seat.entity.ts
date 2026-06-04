import { Bus } from "src/modules/bus/entity/bus.entity";
import { Ticket } from "src/modules/ticket/entity/ticket.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("seats")
export class Seat extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 10 })
  numero!: string;

  @Column({ type: "varchar", length: 20 })
  tipo!: string;

  @ManyToOne(() => Bus, bus => bus.seats)
  @JoinColumn({ name: "busId" })
  bus!: Bus;

  @OneToMany(() => Ticket, ticket => ticket.seat)
  tickets!: Ticket[];
}
