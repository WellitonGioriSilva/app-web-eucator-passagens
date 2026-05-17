import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
// import { AuthService } from "../auth/auth.service";
import { UserService } from "./user.service";
@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class UserModule {}