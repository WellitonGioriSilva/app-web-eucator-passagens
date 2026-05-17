import { Injectable } from "@nestjs/common";
import type { FindOperator, FindOptionsWhere } from "typeorm";
import { And, Between } from "typeorm";
import type { City } from "src/modules/cities/entity/city.entity";
import type { Route } from "src/modules/route/entity/route.entity";
import { Trip } from "./entity/trip.entity";

@Injectable()
export class TripService {
    async getAll(
        cidadeOrigem?: number,
        cidadeDestino?: number,
        dataIda?: string,
        dataVolta?: string,
        tripTipo?: string,
        horariosSaida?: string[]
    ): Promise<Trip[]> {
        const where: FindOptionsWhere<Trip> = {};

        const horarioConditions: FindOperator<Date>[] = [];
        for (const horario of horariosSaida || []) {
            if (horario === "madrugada") {
                horarioConditions.push(
                    Between(
                        new Date("1970-01-01T00:00:00"),
                        new Date("1970-01-01T05:59:59")
                    )
                );
            }
            if (horario === "manha") {
                horarioConditions.push(
                    Between(
                        new Date("1970-01-01T06:00:00"),
                        new Date("1970-01-01T11:59:59")
                    )
                );
            }
            if (horario === "tarde") {
                horarioConditions.push(
                    Between(
                        new Date("1970-01-01T12:00:00"),
                        new Date("1970-01-01T17:59:59")
                    )
                );
            }
            if (horario === "noite") {
                horarioConditions.push(
                    Between(
                        new Date("1970-01-01T18:00:00"),
                        new Date("1970-01-01T23:59:59")
                    )
                );
            }
        }

        if (dataIda) {
            const diaRange = Between(
                new Date(`${dataIda}T00:00:00`),
                new Date(`${dataIda}T23:59:59`)
            );

            where.dtHoraSaida =
                horarioConditions.length > 0
                    ? And(diaRange, ...horarioConditions)
                    : diaRange;
        } else if (horarioConditions.length > 0) {
            where.dtHoraSaida =
                horarioConditions.length === 1
                    ? horarioConditions[0]
                    : (horarioConditions as any);
        }

        if (dataVolta) {
            where.dtHoraSaidaVolta = Between(
                new Date(`${dataVolta}T00:00:00`),
                new Date(`${dataVolta}T23:59:59`)
            );
        }

        if (tripTipo) {
            where.tipoViagem = tripTipo;
        }

        const routeWhere: FindOptionsWhere<Route> = {};

        if (cidadeOrigem) {
            routeWhere.cidadeOrigem = { id: cidadeOrigem } as FindOptionsWhere<City>;
        }
        if (cidadeDestino) {
            routeWhere.cidadeDestino = { id: cidadeDestino } as FindOptionsWhere<City>;
        }
        if (Object.keys(routeWhere).length > 0) {
            where.route = routeWhere;
        }

        return await Trip.find({
            relations: {
                route: { cidadeOrigem: true, cidadeDestino: true },
                routeVolta: { cidadeOrigem: true, cidadeDestino: true },
            },
            where,
        });
    }
}