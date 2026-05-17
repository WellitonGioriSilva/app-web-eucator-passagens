import { BadRequestException, Body, Controller, Get, Post, Query, Render, Res } from "@nestjs/common";
import type { Response } from "express";
import { validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { UserService } from "../user/user.service";
import { UserCreateDto } from "./dto/user.create.dto";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('create')
    async create(@Body() body: UserCreateDto, @Res() res: Response): Promise<void> {
        try {
            // Validação das informações
            const dto = plainToInstance(UserCreateDto, body);
            const errors = validateSync(dto, { forbidUnknownValues: false });
            if (errors.length > 0) {
                const firstError = errors[0];
                const firstMessage = firstError.constraints
                    ? Object.values(firstError.constraints)[0]
                    : 'Dados inválidos.';
                throw new BadRequestException(firstMessage);
            }
            if (dto.password !== dto.confirmPassword) {
                throw new BadRequestException('As senhas não conferem.');
            }
            
            await this.userService.create(dto);
            
            res.render('auth/login', {
                layout: false,
                success: 'Registro realizado com sucesso',
                error: null,
            });
            return;
        }
        catch (error: any) {
            if (error instanceof BadRequestException) {
                res.render('user/create', { layout: false, error: error.message });
                return;
            }
            if (error?.code === 'ER_DUP_ENTRY') {
                res.render('user/create', { layout: false, error: 'E-mail ja cadastrado.' });
                return;
            }
            throw error;
        }
    }


    // Render
    @Get('create')
    @Render('user/create')
    createRender(error: string, success: string): { layout: false, error?: string, success?: string } {
        return { layout: false, error, success }; 
    }

}