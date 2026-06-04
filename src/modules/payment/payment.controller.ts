import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { PaymentEventsService } from "./payment-events.service";
import { PaymentService } from "./payment.service";

@Controller("payments")
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentEvents: PaymentEventsService,
  ) {}

  @Get(":id/events")
  paymentEventsStream(@Param("id") id: string, @Res() res: Response): void {
    const paymentId = Number(id);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write(`event: ready\ndata: ${JSON.stringify({ paymentId })}\n\n`);

    const unsubscribe = this.paymentEvents.onPaymentStatus((event) => {
      if (event.paymentId === paymentId) {
        res.write(`event: payment-status\ndata: ${JSON.stringify(event)}\n\n`);
      }
    });

    res.on("close", unsubscribe);
  }

  @Get(":id/status")
  async status(@Param("id") id: string): Promise<object> {
    return {
      status: "success",
      data: await this.paymentService.getPaymentStatus(Number(id)),
    };
  }

  @Post("webhook")
  async webhook(@Body("paymentId") paymentId: number, @Body("status") status: string): Promise<object> {
    const payment = await this.paymentService.finishPayment(Number(paymentId), status || "finalizado");

    return {
      status: "success",
      data: {
        paymentId: payment.id,
        saleId: payment.sale.id,
        status: payment.status,
      },
    };
  }
}
