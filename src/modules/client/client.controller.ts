import { BadRequestException, Body, Controller, Get, Post, Render, Req, Res, UseGuards } from "@nestjs/common";
import { ClientCreateDto } from "./dto/client.create.dto";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { ClientService } from "./client.service";
import type { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller('client')
export class ClientController {
    constructor(
        private readonly clientService: ClientService
    ) {}

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: ClientCreateDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            // Validação das informações
            const dto = plainToInstance(ClientCreateDto, body);
            const errors = validateSync(dto, { forbidUnknownValues: false });
            if (errors.length > 0) {
                const firstError = errors[0];
                const firstMessage = firstError.constraints
                    ? Object.values(firstError.constraints)[0]
                    : 'Dados inválidos.';
                throw new BadRequestException(firstMessage);
            }
            
            const userId = (req as Request & { user?: { id: number } }).user?.id;
            if (!userId) {
                throw new BadRequestException('Usuario nao autenticado.');
            }
            await this.clientService.create(dto, userId);
            
            res.redirect('/');
            return;
        }
        catch (error: any) {
            if (error instanceof BadRequestException) {
                res.render('client/create', { layout: false, error: error.message });
                return;
            }
            if (error?.code === 'ER_DUP_ENTRY') {
                res.render('client/create', { layout: false, error: 'Cpf ja cadastrado.' });
                return;
            }
            throw error;
        }
    }

    // Render
    @Get()
    @Render('client/create')
    @UseGuards(JwtAuthGuard)
    createRender(layout: boolean, error?: string, success?: string): { layout: boolean, error?: string, success?: string } {
        return { layout: false, error, success }; 
    }
}
