import { DriverTrip } from "src/modules/driver-trip/entity/driver-trip.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("drivers")
export class Driver extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  nome!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  cnh!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @OneToMany(() => DriverTrip, driverTrip => driverTrip.driver)
  driverTrips!: DriverTrip[];
}
