import { Route } from "src/modules/route/entity/route.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

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

    @ManyToOne(() => Route, route => route.tripsIda)
    @JoinColumn({ name: "routeId" })
    route!: Route;

    @ManyToOne(() => Route, route => route.tripsVolta, { nullable: true })
    @JoinColumn({ name: "routeVoltaId" })
    routeVolta?: Route | null;
    
}