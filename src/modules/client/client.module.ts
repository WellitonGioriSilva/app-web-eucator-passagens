import { Module } from "@nestjs/common";
import { ClientService } from "./client.service";
import { ClientController } from "./client.controller";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Module({
    imports: [],
    controllers: [ClientController],
    providers: [ClientService, JwtAuthGuard],
    exports: [],
})
export class ClientModule {}