import { Module } from "@nestjs/common";
import { TripService } from "./trip.service";
import { TripController } from "./trip.controller";
import { CityModule } from "../cities/city.module";
import { TripSeatService } from "./trip-seat.service";
import { PaymentModule } from "../payment/payment.module";
@Module({
  imports: [CityModule, PaymentModule],
  controllers: [TripController],
  providers: [TripService, TripSeatService],
  exports: [TripService],
})
export class TripModule {}
