import { Body, Controller, Get, NotFoundException, Param, Post, Query, Render, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { TripService } from "./trip.service";
import { CityService } from "../cities/city.service";
import { TripSeatService } from "./trip-seat.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PaymentEventsService } from "../payment/payment-events.service";
import { PaymentService } from "../payment/payment.service";
import jwt from "jsonwebtoken";

@Controller('trips')
export class TripController {
    constructor(
        private readonly tripService: TripService,
        private readonly cityService: CityService,
        private readonly tripSeatService: TripSeatService,
        private readonly paymentService: PaymentService,
        private readonly paymentEvents: PaymentEventsService
    ) {}

    // Render
    @Get()
    @Render('trips/index')
    async indexRender(
        @Query('cidadeOrigem') cidadeOrigem?: number,
        @Query('cidadeDestino') cidadeDestino?: number,
        @Query('dataIda') dataIda?: string,
        @Query('dataVolta') dataVolta?: string,
        @Query('tripTipo') tripTipo?: string,
        @Query('horariosSaida') horariosSaida?: string[],
        @Query('ordenacao') ordenacao?: string
    ): Promise<object> {
        const cities = await this.cityService.findAll();

        const normalizedHorarios = Array.isArray(horariosSaida)
            ? horariosSaida
            : horariosSaida
            ? [horariosSaida]
            : [];

        const trips = await this.tripService.getAll(cidadeOrigem, cidadeDestino, dataIda, dataVolta, tripTipo, normalizedHorarios, ordenacao);

        return { 
            layout: true, 
            trips, 
            filters: { 
                cidadeOrigem, 
                cidadeDestino, 
                dataIda, 
                dataVolta, 
                tripTipo, 
                horariosSaida: normalizedHorarios,
                ordenacao: ordenacao || 'maisCedo',
            }, 
            cities 
        };
    }

    @Get(':id/seats')
    @Render('trips/seat-selection')
    async seatSelection(@Param('id') id: string, @Req() req: Request): Promise<object> {
        const tripId = Number(id);
        if (Number.isNaN(tripId)) {
            throw new NotFoundException('Viagem nao encontrada.');
        }

        const trip = await this.tripService.findById(tripId);
        if (!trip) {
            throw new NotFoundException('Viagem nao encontrada.');
        }

        const seatLayout = await this.tripSeatService.buildSeatLayout(trip?.id, trip.bus?.id, this.getUserIdFromCookie(req));
        const basePrice = Number(trip.valor ?? 0);

        return {
            layout: true,
            trip,
            seatLayout,
            basePrice,
        };
    }

    private getUserIdFromCookie(req: Request): number | undefined {
        const token = this.getCookieValue(req.headers.cookie, "jwt");
        if (!token) return undefined;

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { id?: number };
            return payload.id;
        } catch {
            return undefined;
        }
    }

    private getCookieValue(cookieHeader: string | undefined, key: string): string | null {
        if (!cookieHeader) return null;

        const cookies = cookieHeader.split(";").map((item) => item.trim());
        for (const cookie of cookies) {
            if (cookie.startsWith(key + "=")) {
                return decodeURIComponent(cookie.slice(key.length + 1));
            }
        }

        return null;
    }

    @Post(':id/checkout')
    @UseGuards(JwtAuthGuard)
    async checkout(
        @Param('id') id: string,
        @Body('seats') seats: string[],
        @Req() req: Request,
    ): Promise<object> {
        const tripId = Number(id);
        if (Number.isNaN(tripId)) {
            throw new NotFoundException('Viagem nao encontrada.');
        }

        const userId = (req as Request & { user?: { id: number } }).user?.id;
        const payment = await this.paymentService.createPixPayment(userId!, tripId, Array.isArray(seats) ? seats : []);

        return {
            status: "success",
            data: payment,
        };
    }

    @Post(':id/seats/reserve')
    @UseGuards(JwtAuthGuard)
    async reserveSeat(
        @Param('id') id: string,
        @Body('seat') seat: string,
        @Req() req: Request,
    ): Promise<object> {
        const tripId = Number(id);
        if (Number.isNaN(tripId)) {
            throw new NotFoundException('Viagem nao encontrada.');
        }

        const userId = (req as Request & { user?: { id: number } }).user?.id;
        const reservation = await this.paymentService.reserveSeat(userId!, tripId, String(seat));

        return {
            status: "success",
            data: reservation,
        };
    }

    @Post(':id/seats/release')
    @UseGuards(JwtAuthGuard)
    async releaseSeat(
        @Param('id') id: string,
        @Body('seat') seat: string,
        @Req() req: Request,
    ): Promise<object> {
        const tripId = Number(id);
        if (Number.isNaN(tripId)) {
            throw new NotFoundException('Viagem nao encontrada.');
        }

        const userId = (req as Request & { user?: { id: number } }).user?.id;
        const reservation = await this.paymentService.releaseSeatReservation(userId!, tripId, String(seat));

        return {
            status: "success",
            data: reservation,
        };
    }

    @Get(':id/seats/events')
    seatEvents(@Param('id') id: string, @Res() res: Response): void {
        const tripId = Number(id);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();
        res.write(`event: ready\ndata: ${JSON.stringify({ tripId })}\n\n`);

        const unsubscribe = this.paymentEvents.onSeatStatus((event) => {
            if (event.tripId === tripId) {
                res.write(`event: seat-status\ndata: ${JSON.stringify(event)}\n\n`);
            }
        });

        res.on("close", unsubscribe);
    }
}
