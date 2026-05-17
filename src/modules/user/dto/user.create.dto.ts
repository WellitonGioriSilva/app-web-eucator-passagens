import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class UserCreateDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8, { message: 'A senha deve ter ao menos 8 caracteres.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message: 'A senha deve conter letra maiúscula, minúscula, número e caractere especial.',
    })
    password!: string;

    @IsString()
    confirmPassword!: string;
}