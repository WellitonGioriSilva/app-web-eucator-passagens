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

@Module({
  imports: [
      DatabaseModule,
      AuthModule,
      UserModule,
      ClientModule,
      TripModule,
      RouteModule,
      CityModule
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
