import { AppService } from './app.service';
import { Controller, Get, Query, Render } from "@nestjs/common";
import { CityService } from './modules/cities/city.service';
import { TripService } from './modules/trips/trip.service';

@Controller()
export class AppController {
  constructor(
    private readonly tripService: TripService,
    private readonly cityService: CityService,
    private readonly appService: AppService
  ) {}

  @Get()
  @Render('home/index')
  async indexRender(

  ): Promise<object> {
      const cities = await this.cityService.findAll();

      const trips = await this.tripService.getAll();

      return { layout: true, trips, cities };
  }
}
