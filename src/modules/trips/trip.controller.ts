import { Controller, Get, Query, Render } from "@nestjs/common";
import { TripService } from "./trip.service";
import { Trip } from "./entity/trip.entity";
import { CityService } from "../cities/city.service";

@Controller('trips')
export class TripController {
    constructor(
        private readonly tripService: TripService,
        private readonly cityService: CityService
    ) {}

    // Render
    @Get()
    @Render('trips/index')
    async indexRender(
        @Query('cidadeOrigem') cidadeOrigem?: number,
        @Query('cidadeDestino') cidadeDestino?: number,
        @Query('dataIda') dataIda?: string,
        @Query('dataVolta') dataVolta?: string,
        @Query('tripTipo') tripTipo?: string,
        @Query('horariosSaida') horariosSaida?: string[]
    ): Promise<object> {
        const cities = await this.cityService.findAll();

        const trips = await this.tripService.getAll(cidadeOrigem, cidadeDestino, dataIda, dataVolta, tripTipo, horariosSaida);

        return { layout: true, trips, filters: { cidadeOrigem, cidadeDestino, dataIda, dataVolta, tripTipo }, cities };
    }
}