import { IsString, Length } from "class-validator";

export class ClientCreateDto {
    @IsString()
    nome!: string;

    @IsString()
    @Length(14, 14)
    cpf!: string;

    @IsString()
    @Length(15, 15)
    telefone!: string;
}