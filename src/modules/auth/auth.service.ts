import { BadRequestException, Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import { AuthDto } from "./dto/auth.dto";
import { User } from "../user/entity/user.entity";
import { Client } from "../client/entity/client.entity";
import jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
    public async login(authDto: AuthDto): Promise<any> {
        const user = await User.findOneBy({ email: authDto.email });

        if (!user || !bcrypt.compareSync(authDto.password, user.password)) {
            throw new BadRequestException('E-mail ou senha inválidos');
        }

        const hasClient = !!(await Client.findOneBy({ userId: user.id }));

        return { ...this.generateToken(user), hasClient };
    }

    private generateToken(user: User): object {
        return {
            token: jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }),
            refreshToken: jwt.sign({ id: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' })
        };
    }
}