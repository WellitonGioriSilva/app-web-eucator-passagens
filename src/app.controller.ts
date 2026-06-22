import { AppService } from './app.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CityService } from './modules/cities/city.service';
import { TripService } from './modules/trips/trip.service';

@Controller()
export class AppController {
  constructor(
    private readonly tripService: TripService,
    private readonly cityService: CityService,
    private readonly appService: AppService,
  ) {}

  @Get()
  @Render('home/index')
  async indexRender(@Query() query: Record<string, string>): Promise<object> {
    const cities = await this.cityService.findAll();

    const trips = await this.tripService.getPromotionalTrips();

    return { layout: true, trips, cities, query };
  }

  @Get('ofertas')
  @Render('home/index')
  async offersRender(): Promise<object> {
    const [cities, trips] = await Promise.all([
      this.cityService.findAll(),
      this.tripService.getPromotionalTrips(),
    ]);
    return { layout: true, trips, cities };
  }

  @Post('newsletter')
  async newsletter(
    @Body('nome') nome: string,
    @Body('email') email: string,
    @Res() res: Response,
  ): Promise<void> {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nome?.trim() || !validEmail.test(email?.trim() ?? '')) {
      throw new BadRequestException('Informe nome e e-mail validos.');
    }
    await this.appService.subscribeToOffers(nome, email);
    res.redirect('/?newsletter=success#newsletter');
  }
}
