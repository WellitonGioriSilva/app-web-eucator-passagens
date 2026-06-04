import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './config/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ClientModule } from './modules/client/client.module';
import { TripModule } from './modules/trips/trip.module';
import { RouteModule } from './modules/route/route.module';
import { CityModule } from './modules/cities/city.module';
import { BusModule } from './modules/bus/bus.module';
import { DriverModule } from './modules/driver/driver.module';
import { DriverTripModule } from './modules/driver-trip/driver-trip.module';
import { SeatModule } from './modules/seat/seat.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { SaleModule } from './modules/sale/sale.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
      DatabaseModule,
      AuthModule,
      UserModule,
      ClientModule,
      TripModule,
      RouteModule,
      CityModule,
      BusModule,
      SeatModule,
      TicketModule,
      DriverModule,
      DriverTripModule,
      SaleModule,
      PaymentModule
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
