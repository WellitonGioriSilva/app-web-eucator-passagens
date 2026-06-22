import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class ProfileUpdateDto {
  @IsString()
  @Length(2, 255)
  nome!: string;

  @IsString()
  @Length(14, 14)
  cpf!: string;

  @IsString()
  @Length(15, 15)
  telefone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 8)
  cep!: string;

  @IsString()
  @Length(2, 150)
  logradouro!: string;

  @IsString()
  @Length(1, 20)
  numero!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complemento?: string;

  @IsString()
  @Length(2, 100)
  bairro!: string;

  @IsString()
  @Length(2, 100)
  cidade!: string;

  @IsString()
  @Length(2, 2)
  estado!: string;
}
