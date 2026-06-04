import { Injectable } from "@nestjs/common";
import { Seat } from "src/modules/seat/entity/seat.entity";
import { Ticket } from "src/modules/ticket/entity/ticket.entity";

type SeatStatus = "available" | "unavailable" | "mine";

type SeatCell =
  | { type: "seat"; number: string; status: SeatStatus; expiresAt?: Date | null }
  | { type: "aisle" }
  | { type: "empty" };

@Injectable()
export class TripSeatService {
  async buildSeatLayout(tripId: number, busId: number, userId?: number): Promise<SeatCell[][]> {
    const seats = await Seat.getRepository()
      .createQueryBuilder("seat")
      .where("seat.busId = :busId", { busId })
      .orderBy("seat.numero", "ASC")
      .getMany();

    const takenSeats = await Ticket.getRepository()
      .createQueryBuilder("ticket")
      .select("ticket.seatId", "seatId")
      .addSelect("ticket.status", "status")
      .addSelect("ticket.reservedByUserId", "reservedByUserId")
      .addSelect("ticket.reservationExpiresAt", "reservationExpiresAt")
      .where("ticket.tripId = :tripId", { tripId })
      .andWhere(
        "(ticket.status = :soldStatus OR (ticket.status = :reservedStatus AND ticket.reservationExpiresAt > NOW()))",
        {
          soldStatus: "vendido",
          reservedStatus: "reservado",
        },
      )
      .getRawMany();

    const takenSeatsById = new Map<number, { status?: string; reservedByUserId?: number | null; reservationExpiresAt?: Date | null }>();
    takenSeats.forEach(row => {
      takenSeatsById.set(Number(row.seatId), {
        status: row.status,
        reservedByUserId: row.reservedByUserId ? Number(row.reservedByUserId) : null,
        reservationExpiresAt: row.reservationExpiresAt ?? null,
      });
    });
    const rows = Math.ceil(seats.length / 4);
    const layout: SeatCell[][] = [];
    let seatIndex = 0;

    for (let row = 0; row < rows; row += 1) {
      const rowCells: SeatCell[] = [];

      for (let left = 0; left < 2; left += 1) {
        rowCells.push(this.buildSeatCell(seats[seatIndex], takenSeatsById, userId));
        seatIndex += 1;
      }

      rowCells.push({ type: "aisle" });

      for (let right = 0; right < 2; right += 1) {
        rowCells.push(this.buildSeatCell(seats[seatIndex], takenSeatsById, userId));
        seatIndex += 1;
      }

      layout.push(rowCells);
    }

    return layout;
  }

  private buildSeatCell(
    seat: Seat | undefined,
    takenSeatsById: Map<number, { status?: string; reservedByUserId?: number | null; reservationExpiresAt?: Date | null }>,
    userId?: number,
  ): SeatCell {
    if (!seat) {
      return { type: "empty" };
    }

    const seatNumber = seat.numero ?? String(seat.id);
    const takenSeat = takenSeatsById.get(seat.id);
    const isMine = takenSeat?.status === "reservado" && !!userId && takenSeat?.reservedByUserId === userId;

    return {
      type: "seat",
      number: seatNumber,
      status: takenSeat ? (isMine ? "mine" : "unavailable") : "available",
      expiresAt: takenSeat?.reservationExpiresAt ?? null,
    };
  }
}
