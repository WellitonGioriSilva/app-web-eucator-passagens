import { Injectable } from "@nestjs/common";
import { City } from "./entity/city.entity";

@Injectable()
export class CityService {
    async findAll(nome?: string) : Promise<City[]> {
        const cities = City.find({ where: { nome } });
        return cities;
    }
}