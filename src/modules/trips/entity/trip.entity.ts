import { Bus } from "src/modules/bus/entity/bus.entity";
import { DriverTrip } from "src/modules/driver-trip/entity/driver-trip.entity";
import { Route } from "src/modules/route/entity/route.entity";
import { Ticket } from "src/modules/ticket/entity/ticket.entity";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity("trips")
export class Trip extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "datetime" })
    dtHoraSaida!: Date;

    @Column({ type: "datetime", nullable: true })
    dtHoraSaidaVolta?: Date | null;

    @Column({ type: "time" })
    duracao!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    valor!: number;

    @Column({ type: "char", length: 2 })
    tipoViagem!: string;

    @Column({ type: "varchar", length: 255 })
    urlImagem!: string;

    @ManyToOne(() => Bus, bus => bus.trips)
    @JoinColumn({ name: "busId" })
    bus!: Bus;

    @ManyToOne(() => Route, route => route.tripsIda)
    @JoinColumn({ name: "routeId" })
    route!: Route;

    @ManyToOne(() => Route, route => route.tripsVolta, { nullable: true })
    @JoinColumn({ name: "routeVoltaId" })
    routeVolta?: Route | null;

    @OneToMany(() => Ticket, ticket => ticket.trip)
    tickets!: Ticket[];

    @OneToMany(() => DriverTrip, driverTrip => driverTrip.trip)
    driverTrips!: DriverTrip[];
    
}