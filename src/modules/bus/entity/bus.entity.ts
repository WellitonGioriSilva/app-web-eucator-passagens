import { Seat } from "src/modules/seat/entity/seat.entity";
import { Trip } from "src/modules/trips/entity/trip.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("buses")
export class Bus extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 20 })
  placa!: string;

  @Column({ type: "varchar", length: 80 })
  modelo!: string;

  @Column({ type: "int" })
  capacidade!: number;

  @OneToMany(() => Seat, seat => seat.bus)
  seats!: Seat[];

  @OneToMany(() => Trip, trip => trip.bus)
  trips!: Trip[];
}
