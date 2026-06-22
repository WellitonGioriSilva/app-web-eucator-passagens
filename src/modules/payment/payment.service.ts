import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client } from 'src/modules/client/entity/client.entity';
import { Payment } from 'src/modules/payment/entity/payment.entity';
import { PaymentEventsService } from 'src/modules/payment/payment-events.service';
import { Sale } from 'src/modules/sale/entity/sale.entity';
import { Seat } from 'src/modules/seat/entity/seat.entity';
import { Ticket } from 'src/modules/ticket/entity/ticket.entity';
import { Trip } from 'src/modules/trips/entity/trip.entity';

const RESERVATION_MINUTES = 5;

@Injectable()
export class PaymentService {
  constructor(private readonly events: PaymentEventsService) {}

  async reserveSeat(userId: number, tripId: number, seatNumber: string) {
    const { trip, seat } = await this.findTripSeat(tripId, seatNumber);
    const existingTicket = await Ticket.getRepository()
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.seat', 'seat')
      .where('ticket.tripId = :tripId', { tripId })
      .andWhere('ticket.seatId = :seatId', { seatId: seat.id })
      .andWhere(
        '(ticket.status = :soldStatus OR (ticket.status = :reservedStatus AND ticket.reservationExpiresAt > NOW()))',
        {
          soldStatus: 'vendido',
          reservedStatus: 'reservado',
        },
      )
      .getOne();

    if (existingTicket && existingTicket.reservedByUserId !== userId) {
      throw new BadRequestException(`Poltrona ${seatNumber} indisponivel.`);
    }

    const reservationExpiresAt = this.getReservationExpiration();
    const ticket = existingTicket ?? Ticket.create({ trip, seat });
    ticket.status = 'reservado';
    ticket.reservationExpiresAt = reservationExpiresAt;
    ticket.reservedByUserId = userId;
    await ticket.save();

    this.events.emitSeatStatus({
      tripId,
      seats: [seat.numero],
      status: 'unavailable',
    });
    this.expireSeatReservationAfterDelay(ticket.id, tripId, seat.numero);

    return {
      seat: seat.numero,
      expiresAt: reservationExpiresAt,
    };
  }

  async releaseSeatReservation(
    userId: number,
    tripId: number,
    seatNumber: string,
  ) {
    const { seat } = await this.findTripSeat(tripId, seatNumber);
    await Ticket.getRepository()
      .createQueryBuilder()
      .update(Ticket)
      .set({ status: 'expirado', reservationExpiresAt: null })
      .where('tripId = :tripId', { tripId })
      .andWhere('seatId = :seatId', { seatId: seat.id })
      .andWhere('reservedByUserId = :userId', { userId })
      .andWhere('status = :status', { status: 'reservado' })
      .andWhere('saleId IS NULL')
      .execute();

    this.events.emitSeatStatus({
      tripId,
      seats: [seat.numero],
      status: 'available',
    });

    return { seat: seat.numero };
  }

  async createPixPayment(
    userId: number,
    tripId: number,
    seatNumbers: string[],
  ) {
    if (!seatNumbers.length) {
      throw new BadRequestException('Selecione ao menos uma poltrona.');
    }

    const client = await Client.findOneBy({ userId });
    if (!client) {
      throw new BadRequestException(
        'Complete seu cadastro de cliente antes de comprar.',
      );
    }

    const trip = await Trip.getRepository().findOne({
      where: { id: tripId },
      relations: { bus: true, promotions: true },
    });
    if (!trip?.bus) {
      throw new NotFoundException('Viagem nao encontrada.');
    }

    const uniqueSeatNumbers = Array.from(new Set(seatNumbers.map(String)));
    const requestedSeatNumbers = new Set(
      uniqueSeatNumbers.map((number) => this.normalizeSeatNumber(number)),
    );
    const busSeats = await Seat.getRepository()
      .createQueryBuilder('seat')
      .where('seat.busId = :busId', { busId: trip.bus.id })
      .getMany();
    const seats = busSeats.filter((seat) =>
      requestedSeatNumbers.has(this.normalizeSeatNumber(seat.numero)),
    );

    if (seats.length !== requestedSeatNumbers.size) {
      throw new BadRequestException(
        'Uma ou mais poltronas nao foram encontradas.',
      );
    }

    const seatIds = seats.map((seat) => seat.id);
    const unavailableSeats = await Ticket.getRepository()
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.seat', 'seat')
      .where('ticket.tripId = :tripId', { tripId })
      .andWhere('ticket.seatId IN (:...seatIds)', { seatIds })
      .andWhere(
        '(ticket.status = :soldStatus OR (ticket.status = :reservedStatus AND ticket.reservationExpiresAt > NOW() AND (ticket.reservedByUserId IS NULL OR ticket.reservedByUserId != :userId)))',
        {
          soldStatus: 'vendido',
          reservedStatus: 'reservado',
          userId,
        },
      )
      .getMany();

    if (unavailableSeats.length) {
      const numbers = unavailableSeats
        .map((ticket) => ticket.seat.numero)
        .join(', ');
      throw new BadRequestException(`Poltrona indisponivel: ${numbers}.`);
    }

    const now = Date.now();
    const promotion = (trip.promotions ?? [])
      .filter(
        (item) =>
          item.ativa &&
          new Date(item.dataInicio).getTime() <= now &&
          new Date(item.dataFim).getTime() >= now,
      )
      .sort(
        (a, b) => Number(b.percentualDesconto) - Number(a.percentualDesconto),
      )[0];
    const discountPercentage = promotion
      ? Number(promotion.percentualDesconto)
      : 0;
    const originalTotal = Number(trip.valor ?? 0) * seats.length;
    const discountAmount = (originalTotal * discountPercentage) / 100;
    const subTotal = Number((originalTotal - discountAmount).toFixed(2));
    const reservationExpiresAt = this.getReservationExpiration();
    const sale = Sale.create({
      dataHora: new Date(),
      desconto: discountAmount,
      subTotal,
      status: 'pendente',
      client,
    });
    await sale.save();

    const tickets = await Ticket.getRepository()
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.seat', 'seat')
      .where('ticket.tripId = :tripId', { tripId })
      .andWhere('ticket.seatId IN (:...seatIds)', { seatIds })
      .andWhere('ticket.reservedByUserId = :userId', { userId })
      .andWhere('ticket.status = :status', { status: 'reservado' })
      .andWhere('ticket.reservationExpiresAt > NOW()')
      .getMany();
    const ticketsBySeatId = new Map(
      tickets.map((ticket) => [ticket.seat.id, ticket]),
    );

    for (const seat of seats) {
      const ticket =
        ticketsBySeatId.get(seat.id) ??
        Ticket.create({
          status: 'reservado',
          reservationExpiresAt,
          reservedByUserId: userId,
          trip,
          seat,
        });
      ticket.status = 'reservado';
      ticket.reservationExpiresAt = reservationExpiresAt;
      ticket.reservedByUserId = userId;
      ticket.sale = sale;
      await ticket.save();
    }

    const payment = Payment.create({
      tipo: 'PIX',
      valor: subTotal,
      status: 'pendente',
      dataHoraPagamento: null,
      pixCopiaCola: this.buildPixPayload(sale.id, subTotal),
      sale,
    });
    await payment.save();

    this.events.emitSeatStatus({
      tripId,
      seats: seats.map((seat) => seat.numero),
      status: 'unavailable',
    });
    this.expireReservationAfterDelay(
      payment.id,
      tripId,
      seats.map((seat) => seat.numero),
    );

    return {
      paymentId: payment.id,
      saleId: sale.id,
      status: payment.status,
      amount: subTotal,
      pixCopiaCola: payment.pixCopiaCola,
    };
  }

  async finishPayment(paymentId: number, status: string) {
    const payment = await Payment.getRepository().findOne({
      where: { id: paymentId },
      relations: { sale: true },
    });
    if (!payment) {
      throw new NotFoundException('Pagamento nao encontrado.');
    }

    payment.status = status;
    if (status === 'finalizado') {
      payment.dataHoraPagamento = new Date();
      await Sale.getRepository().update(payment.sale.id, {
        status: 'finalizada',
      });
      await Ticket.getRepository()
        .createQueryBuilder()
        .update(Ticket)
        .set({
          status: 'vendido',
          reservationExpiresAt: null,
          reservedByUserId: null,
        })
        .where('saleId = :saleId', { saleId: payment.sale.id })
        .execute();
    }
    await payment.save();

    this.events.emitPaymentStatus({
      paymentId: payment.id,
      saleId: payment.sale.id,
      status: payment.status,
    });

    return payment;
  }

  private buildPixPayload(saleId: number, amount: number): string {
    return `PIX-EUCATOR-SALE-${saleId}-BRL-${amount.toFixed(2)}`;
  }

  async getPaymentStatus(paymentId: number) {
    const payment = await Payment.getRepository().findOne({
      where: { id: paymentId },
      relations: { sale: true },
    });
    if (!payment) {
      throw new NotFoundException('Pagamento nao encontrado.');
    }

    return {
      paymentId: payment.id,
      saleId: payment.sale.id,
      status: payment.status,
    };
  }

  private getReservationExpiration(): Date {
    return new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);
  }

  private async findTripSeat(tripId: number, seatNumber: string) {
    const trip = await Trip.getRepository().findOne({
      where: { id: tripId },
      relations: { bus: true },
    });
    if (!trip?.bus) {
      throw new NotFoundException('Viagem nao encontrada.');
    }

    const normalizedSeatNumber = this.normalizeSeatNumber(seatNumber);
    const seats = await Seat.getRepository()
      .createQueryBuilder('seat')
      .where('seat.busId = :busId', { busId: trip.bus.id })
      .getMany();
    const seat = seats.find(
      (item) => this.normalizeSeatNumber(item.numero) === normalizedSeatNumber,
    );
    if (!seat) {
      throw new NotFoundException('Poltrona nao encontrada.');
    }

    return { trip, seat };
  }

  private normalizeSeatNumber(value: string): string {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? value.trim() : String(numericValue);
  }

  private expireSeatReservationAfterDelay(
    ticketId: number,
    tripId: number,
    seatNumber: string,
  ): void {
    const timer = setTimeout(
      async () => {
        const ticket = await Ticket.getRepository().findOne({
          where: { id: ticketId },
          relations: { sale: true },
        });

        if (
          !ticket ||
          ticket.sale ||
          ticket.status !== 'reservado' ||
          !ticket.reservationExpiresAt ||
          ticket.reservationExpiresAt > new Date()
        ) {
          return;
        }

        ticket.status = 'expirado';
        ticket.reservationExpiresAt = null;
        await ticket.save();

        this.events.emitSeatStatus({
          tripId,
          seats: [seatNumber],
          status: 'available',
        });
      },
      RESERVATION_MINUTES * 60 * 1000,
    );

    timer.unref?.();
  }

  private expireReservationAfterDelay(
    paymentId: number,
    tripId: number,
    seats: string[],
  ): void {
    const timer = setTimeout(
      async () => {
        const payment = await Payment.getRepository().findOne({
          where: { id: paymentId },
          relations: { sale: true },
        });

        if (!payment || payment.status !== 'pendente') {
          return;
        }

        payment.status = 'expirado';
        await payment.save();
        await Sale.getRepository().update(payment.sale.id, {
          status: 'expirada',
        });
        await Ticket.getRepository()
          .createQueryBuilder()
          .update(Ticket)
          .set({ status: 'expirado' })
          .where('saleId = :saleId', { saleId: payment.sale.id })
          .andWhere('status = :status', { status: 'reservado' })
          .execute();

        this.events.emitPaymentStatus({
          paymentId: payment.id,
          saleId: payment.sale.id,
          status: payment.status,
        });
        this.events.emitSeatStatus({
          tripId,
          seats,
          status: 'available',
        });
      },
      RESERVATION_MINUTES * 60 * 1000,
    );

    timer.unref?.();
  }
}
