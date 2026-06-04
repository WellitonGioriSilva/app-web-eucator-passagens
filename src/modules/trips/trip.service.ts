import { Injectable } from "@nestjs/common";
import { Trip } from "./entity/trip.entity";

const HORARIO_RANGES: Record<string, { start: string; end: string }> = {
    madrugada: { start: "00:00:00", end: "05:59:59" },
    manha:     { start: "06:00:00", end: "11:59:59" },
    tarde:     { start: "12:00:00", end: "17:59:59" },
    noite:     { start: "18:00:00", end: "23:59:59" },
};

@Injectable()
export class TripService {
    async findById(id: number): Promise<Trip | null> {
        return Trip.getRepository().findOne({
            where: { id },
            relations: {
                bus: true,
                route: { cidadeOrigem: true, cidadeDestino: true },
                routeVolta: { cidadeOrigem: true, cidadeDestino: true },
            },
        });
    }

    async getAll(
        cidadeOrigem?: number,
        cidadeDestino?: number,
        dataIda?: string,
        dataVolta?: string,
        tripTipo?: string,
        horariosSaida?: string[],
        ordenacao?: string
    ): Promise<Trip[]> {
        const qb = Trip.getRepository()
            .createQueryBuilder("trip")
            .leftJoinAndSelect("trip.route", "route")
            .leftJoinAndSelect("route.cidadeOrigem", "cidadeOrigem")
            .leftJoinAndSelect("route.cidadeDestino", "cidadeDestino")
            .leftJoinAndSelect("trip.routeVolta", "routeVolta")
            .leftJoinAndSelect("routeVolta.cidadeOrigem", "cidadeOrigemVolta")
            .leftJoinAndSelect("routeVolta.cidadeDestino", "cidadeDestinoVolta");

        if (dataIda) {
            qb.andWhere("trip.dtHoraSaida BETWEEN :diaInicio AND :diaFim", {
                diaInicio: `${dataIda} 00:00:00`,
                diaFim:    `${dataIda} 23:59:59`,
            });
        }

        const horarios = horariosSaida?.filter(h => HORARIO_RANGES[h]) ?? [];
        if (horarios.length > 0) {
            const clauses = horarios.map((_horario, i) =>
                `TIME(trip.dtHoraSaida) BETWEEN :horStart${i} AND :horEnd${i}`
            );
            const params: Record<string, string> = {};
            horarios.forEach((horario, i) => {
                params[`horStart${i}`] = HORARIO_RANGES[horario].start;
                params[`horEnd${i}`]   = HORARIO_RANGES[horario].end;
            });

            qb.andWhere(`(${clauses.join(" OR ")})`, params);
        }

        if (dataVolta) {
            qb.andWhere("trip.dtHoraSaidaVolta BETWEEN :voltaInicio AND :voltaFim", {
                voltaInicio: `${dataVolta} 00:00:00`,
                voltaFim:    `${dataVolta} 23:59:59`,
            });
        }

        if (tripTipo) {
            qb.andWhere("trip.tipoViagem = :tripTipo", { tripTipo });
        }

        if (cidadeOrigem) {
            qb.andWhere("cidadeOrigem.id = :cidadeOrigem", { cidadeOrigem });
        }

        if (cidadeDestino) {
            qb.andWhere("cidadeDestino.id = :cidadeDestino", { cidadeDestino });
        }

        if (ordenacao === "menorPreco") {
            qb.orderBy("trip.valor", "ASC");
        } else {
            qb.orderBy("trip.dtHoraSaida", "ASC");
        }

        return qb.getMany();
    }
}