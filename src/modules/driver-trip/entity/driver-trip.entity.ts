import { Driver } from "src/modules/driver/entity/driver.entity";
import { Trip } from "src/modules/trips/entity/trip.entity";
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("driver_trips")
export class DriverTrip extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Driver, driver => driver.driverTrips)
  @JoinColumn({ name: "driverId" })
  driver!: Driver;

  @ManyToOne(() => Trip, trip => trip.driverTrips)
  @JoinColumn({ name: "tripId" })
  trip!: Trip;
}
