import { Route } from "src/modules/route/entity/route.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("cities")
export class City extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column({ length: 2 })
    uf!: string;

    @OneToMany(() => Route, route => route.cidadeOrigem)
    routesOrigem!: Route[];

    @OneToMany(() => Route, route => route.cidadeDestino)
    routesDestino!: Route[];
}