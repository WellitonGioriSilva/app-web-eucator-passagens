import { Seat } from "src/modules/seat/entity/seat.entity";
import { Sale } from "src/modules/sale/entity/sale.entity";
import { Trip } from "src/modules/trips/entity/trip.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("tickets")
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 20 })
  status!: string;

  @Column({ type: "datetime", nullable: true })
  reservationExpiresAt?: Date | null;

  @Column({ type: "int", nullable: true })
  reservedByUserId?: number | null;

  @ManyToOne(() => Trip, trip => trip.tickets)
  @JoinColumn({ name: "tripId" })
  trip!: Trip;

  @ManyToOne(() => Seat, seat => seat.tickets)
  @JoinColumn({ name: "seatId" })
  seat!: Seat;

  @ManyToOne(() => Sale, sale => sale.tickets, { nullable: true })
  @JoinColumn({ name: "saleId" })
  sale?: Sale | null;
}
