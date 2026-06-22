import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UserService } from '../user/user.service';
import { UserCreateDto } from './dto/user.create.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileUpdateDto } from './dto/profile.update.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async create(
    @Body() body: UserCreateDto,
    @Res() res: Response,
  ): Promise<void> {
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
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        res.render('user/create', { layout: false, error: error.message });
        return;
      }
      if (error?.code === 'ER_DUP_ENTRY') {
        res.render('user/create', {
          layout: false,
          error: 'E-mail ja cadastrado.',
        });
        return;
      }
      throw error;
    }
  }

  // Render
  @Get('create')
  @Render('user/create')
  createRender(
    error: string,
    success: string,
  ): { layout: false; error?: string; success?: string } {
    return { layout: false, error, success };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req: Request, @Res() res: Response): Promise<void> {
    const userId = (req as Request & { user?: { id: number } }).user?.id;
    const user = userId ? await this.userService.findProfile(userId) : null;

    if (!user) {
      res.redirect('/auth');
      return;
    }
    const tickets = await this.userService.findTicketsByUser(user.id);

    res.render('user/profile', {
      layout: true,
      user,
      client: user.client ?? null,
      tickets,
      query: req.query,
    });
  }

  @Get('tickets/:id/pdf')
  @UseGuards(JwtAuthGuard)
  async ticketPdf(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const userId = (req as Request & { user?: { id: number } }).user?.id;
    const pdf = await this.userService.generateTicketPdf(userId!, Number(id));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=passagem-${id}.pdf`);
    res.send(pdf);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() body: ProfileUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const dto = plainToInstance(ProfileUpdateDto, body);
    const errors = validateSync(dto, { forbidUnknownValues: false });
    if (errors.length)
      throw new BadRequestException(
        Object.values(errors[0].constraints ?? {})[0] ?? 'Dados invalidos.',
      );
    const userId = (req as Request & { user?: { id: number } }).user?.id;
    await this.userService.updateProfile(userId!, dto);
    res.redirect('/user/profile?updated=1');
  }
}
