import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentEventsService } from "./payment-events.service";
import { PaymentService } from "./payment.service";

@Module({
  controllers: [PaymentController],
  providers: [PaymentEventsService, PaymentService],
  exports: [PaymentEventsService, PaymentService],
})
export class PaymentModule {}
