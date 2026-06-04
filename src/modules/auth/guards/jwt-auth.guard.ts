import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
    id: number;
    email: string;
    iat?: number;
    exp?: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();
        const token = this.getToken(req);

        if (!token) {
            if (this.acceptsHtml(req) && res?.redirect) {
                res.redirect("/auth");
                return false;
            }
            throw new UnauthorizedException("Token ausente ou invalido.");
        }

        try {
            const payload = jwt.verify(
                token,
                process.env.JWT_SECRET || "default_secret"
            ) as JwtPayload;

            (req as Request & { user: JwtPayload }).user = payload;
            return true;
        } catch {
            if (this.acceptsHtml(req) && res?.redirect) {
                res.redirect("/auth");
                return false;
            }
            throw new UnauthorizedException("Token invalido ou expirado.");
        }
    }

    private acceptsHtml(req: Request): boolean {
        const accept = req.headers.accept ?? "";
        return accept.includes("text/html") || !accept.includes("application/json");
    }

    private getToken(req: Request): string | null {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return authHeader.slice("Bearer ".length).trim();
        }

        const cookieToken = this.getCookieValue(req.headers.cookie, "jwt");
        if (cookieToken) {
            return cookieToken;
        }

        const bodyToken = (req.body as { token?: string } | undefined)?.token;
        if (bodyToken) {
            return bodyToken;
        }

        return null;
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
