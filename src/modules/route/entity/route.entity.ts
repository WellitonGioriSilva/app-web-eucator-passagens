import { City } from "src/modules/cities/entity/city.entity";
import { Trip } from "src/modules/trips/entity/trip.entity";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity("routes")
export class Route extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    distancia!: number;

    @ManyToOne(() => City, city => city.routesOrigem)
    @JoinColumn({ name: "cidadeOrigemId" })
    cidadeOrigem!: City;

    @ManyToOne(() => City, city => city.routesDestino)
    @JoinColumn({ name: "cidadeDestinoId" })
    cidadeDestino!: City;

    @OneToMany(() => Trip, trip => trip.route)
    tripsIda!: Trip[];

    @OneToMany(() => Trip, trip => trip.routeVolta)
    tripsVolta!: Trip[];
}