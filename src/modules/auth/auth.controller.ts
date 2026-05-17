import { BadRequestException, Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import jwt from "jsonwebtoken";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}
    
    @Post('login')
    async auth(@Body() authDto: AuthDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            const data = await this.authService.login(authDto);

            res.cookie('jwt', data.token, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 1000,
            });

            res.json({
                status: 'success',
                data,
                message: 'Login realizado com sucesso'
            });
            return;
        } catch (error) {
            if (error instanceof BadRequestException) {
                res.render('auth/login', { layout: false, error: error.message });
                return;
            }

            throw error;
        }
    }

    // Render
    @Get()
    authRender(@Req() req: Request, @Res() res: Response): void {
        const token = this.getCookieValue(req.headers.cookie, "jwt");
        if (token) {
            try {
                jwt.verify(token, process.env.JWT_SECRET || "default_secret");
                res.redirect("/");
                return;
            } catch {
                // token invalido, segue para tela de login
            }
        }
        res.render("auth/login", { layout: false, error: null });
    }

    private getCookieValue(cookieHeader: string | undefined, key: string): string | null {
        if (!cookieHeader) {
            return null;
        }

        const cookies = cookieHeader.split(";").map((item) => item.trim());
        for (const cookie of cookies) {
            if (cookie.startsWith(key + "=")) {
                return decodeURIComponent(cookie.slice(key.length + 1));
            }
        }

        return null;
    }

}