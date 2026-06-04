import { Injectable } from "@nestjs/common";
import { EventEmitter } from "node:events";

export type PaymentStatusEvent = {
  paymentId: number;
  saleId: number;
  status: string;
};

export type SeatStatusEvent = {
  tripId: number;
  seats: string[];
  status: "unavailable" | "available";
};

@Injectable()
export class PaymentEventsService {
  private readonly events = new EventEmitter();

  onPaymentStatus(listener: (event: PaymentStatusEvent) => void): () => void {
    this.events.on("payment-status", listener);
    return () => this.events.off("payment-status", listener);
  }

  emitPaymentStatus(event: PaymentStatusEvent): void {
    this.events.emit("payment-status", event);
  }

  onSeatStatus(listener: (event: SeatStatusEvent) => void): () => void {
    this.events.on("seat-status", listener);
    return () => this.events.off("seat-status", listener);
  }

  emitSeatStatus(event: SeatStatusEvent): void {
    this.events.emit("seat-status", event);
  }
}
