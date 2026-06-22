import { UserCreateDto } from './dto/user.create.dto';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Ticket } from '../ticket/entity/ticket.entity';
import { ProfileUpdateDto } from './dto/profile.update.dto';
import { Client } from '../client/entity/client.entity';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync, inflateSync } from 'node:zlib';

export class UserService {
  async create(data: UserCreateDto) {
    data.password = await bcrypt.hash(data.password, 10);
    const user = User.create(data);
    await user.save();
  }

  async findProfile(userId: number): Promise<User | null> {
    return User.getRepository().findOne({
      where: { id: userId },
      relations: { client: true },
    });
  }

  async updateProfile(userId: number, data: ProfileUpdateDto): Promise<User> {
    const user = await this.findProfile(userId);
    if (!user?.client)
      throw new NotFoundException('Cadastro de cliente nao encontrado.');

    const email = data.email.trim().toLowerCase();
    const emailOwner = await User.findOneBy({ email });
    if (emailOwner && emailOwner.id !== userId)
      throw new BadRequestException('E-mail ja cadastrado.');

    const cpfOwner = await Client.findOneBy({ cpf: data.cpf });
    if (cpfOwner && cpfOwner.id !== user.client.id)
      throw new BadRequestException('CPF ja cadastrado.');

    user.email = email;
    user.client.nome = data.nome.trim();
    user.client.cpf = data.cpf;
    user.client.telefone = data.telefone;
    user.client.cep = data.cep;
    user.client.logradouro = data.logradouro.trim();
    user.client.numero = data.numero.trim();
    user.client.complemento = data.complemento?.trim() || null;
    user.client.bairro = data.bairro.trim();
    user.client.cidade = data.cidade.trim();
    user.client.estado = data.estado.trim().toUpperCase();
    await user.save();
    await user.client.save();
    return user;
  }

  async findTicketsByUser(userId: number): Promise<Ticket[]> {
    return Ticket.getRepository().find({
      where: {
        sale: {
          client: {
            userId,
          },
        },
      },
      relations: {
        seat: true,
        sale: {
          client: true,
          payments: true,
        },
        trip: {
          route: {
            cidadeOrigem: true,
            cidadeDestino: true,
          },
        },
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async generateTicketPdf(userId: number, ticketId: number): Promise<Buffer> {
    const ticket = await Ticket.getRepository().findOne({
      where: {
        id: ticketId,
        sale: {
          client: {
            userId,
          },
        },
      },
      relations: {
        seat: true,
        sale: {
          client: true,
          payments: true,
        },
        trip: {
          route: {
            cidadeOrigem: true,
            cidadeDestino: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Passagem nao encontrada.');
    }

    const payment = ticket.sale?.payments?.[0];
    return this.createTicketPdf({
      ticketNumber: ticket.id,
      saleNumber: ticket.sale?.id ?? 0,
      passenger: ticket.sale?.client.nome ?? '',
      cpf: ticket.sale?.client.cpf ?? '',
      origin: `${ticket.trip.route.cidadeOrigem.nome} - ${ticket.trip.route.cidadeOrigem.uf}`,
      destination: `${ticket.trip.route.cidadeDestino.nome} - ${ticket.trip.route.cidadeDestino.uf}`,
      departure: this.formatDate(ticket.trip.dtHoraSaida),
      seat: ticket.seat.numero,
      value: Number(payment?.valor ?? ticket.trip.valor),
      payment: payment?.tipo ?? 'Nao informado',
    });
  }

  private formatDate(value: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  private createTicketPdf(data: {
    ticketNumber: number;
    saleNumber: number;
    passenger: string;
    cpf: string;
    origin: string;
    destination: string;
    departure: string;
    seat: string;
    value: number;
    payment: string;
  }): Buffer {
    const t = (value: string, x: number, y: number, size = 9, bold = false) =>
      `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${this.escapePdf(value)}) Tj ET`;
    const line = (x1: number, y1: number, x2: number, y2: number) =>
      `${x1} ${y1} m ${x2} ${y2} l S`;
    const rect = (x: number, y: number, width: number, height: number) =>
      `${x} ${y} ${width} ${height} re S`;
    const money = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(data.value);
    const content = [
      '0.45 w 0 G',
      t('BILHETE DE PASSAGEM RODOVIARIO', 184, 800, 12, true),
      rect(45, 515, 505, 260),
      rect(60, 700, 475, 58),
      t('Nome do passageiro:', 70, 740, 7),
      t(data.passenger, 70, 727, 10, true),
      t(`CPF: ${data.cpf}`, 70, 712, 8),
      'q 115 0 0 29 405 716 cm /Logo Do Q',
      rect(60, 670, 475, 22),
      t('BILHETE DE PASSAGEM RODOVIARIO', 205, 678, 9, true),
      rect(60, 636, 475, 26),
      line(218, 636, 218, 662),
      line(380, 636, 380, 662),
      t(`No. ${data.ticketNumber}`, 68, 650, 8),
      t(`Serie/Subserie: ${data.saleNumber}`, 230, 650, 8),
      t('Via: Passageiro', 392, 650, 8),
      rect(60, 596, 475, 32),
      line(60, 612, 535, 612),
      line(297, 596, 297, 628),
      t(`De: ${data.origin}`, 68, 617, 8),
      t(`Para: ${data.destination}`, 305, 617, 8),
      t(`Linha: ${data.origin} / ${data.destination}`, 68, 601, 8),
      rect(60, 530, 475, 58),
      line(300, 530, 300, 588),
      line(410, 530, 410, 588),
      line(60, 559, 535, 559),
      line(180, 530, 180, 588),
      t('Data / horario', 82, 575, 8, true),
      t('Poltrona', 213, 575, 8, true),
      t('Pagamento', 320, 575, 8, true),
      t('Valor', 448, 575, 8, true),
      t(data.departure, 70, 543, 8),
      t(data.seat, 238, 543, 9, true),
      t(data.payment, 320, 543, 8),
      t(money, 440, 543, 9, true),
    ].join('\n');
    const logo = this.readPngForPdf(
      join(process.cwd(), 'public', 'images', 'logo.png'),
    );
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Logo 8 0 R >> >> /Contents 6 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
      `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${logo.alpha.length} >>\nstream\n${logo.alpha.toString('latin1')}\nendstream`,
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /SMask 7 0 R /Filter /FlateDecode /Length ${logo.rgb.length} >>\nstream\n${logo.rgb.toString('latin1')}\nendstream`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(pdf, 'latin1'));
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf, 'latin1');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'latin1');
  }

  private readPngForPdf(path: string): {
    width: number;
    height: number;
    rgb: Buffer;
    alpha: Buffer;
  } {
    const png = readFileSync(path);
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const chunks: Buffer[] = [];
    for (let offset = 8; offset < png.length; ) {
      const length = png.readUInt32BE(offset);
      const type = png.toString('ascii', offset + 4, offset + 8);
      if (type === 'IDAT')
        chunks.push(png.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    const raw = inflateSync(Buffer.concat(chunks));
    const stride = width * 4;
    const decoded = Buffer.alloc(stride * height);
    let sourceOffset = 0;
    for (let y = 0; y < height; y++) {
      const filter = raw[sourceOffset++];
      for (let x = 0; x < stride; x++) {
        const value = raw[sourceOffset++];
        const left = x >= 4 ? decoded[y * stride + x - 4] : 0;
        const up = y > 0 ? decoded[(y - 1) * stride + x] : 0;
        const upLeft = y > 0 && x >= 4 ? decoded[(y - 1) * stride + x - 4] : 0;
        const paeth = this.paethPredictor(left, up, upLeft);
        decoded[y * stride + x] =
          (value + [0, left, up, Math.floor((left + up) / 2), paeth][filter]) &
          255;
      }
    }
    const rgb = Buffer.alloc(width * height * 3);
    const alpha = Buffer.alloc(width * height);
    for (let i = 0, rgbOffset = 0; i < decoded.length; i += 4) {
      rgb[rgbOffset++] = decoded[i];
      rgb[rgbOffset++] = decoded[i + 1];
      rgb[rgbOffset++] = decoded[i + 2];
      alpha[i / 4] = decoded[i + 3];
    }
    return { width, height, rgb: deflateSync(rgb), alpha: deflateSync(alpha) };
  }

  private paethPredictor(a: number, b: number, c: number): number {
    const p = a + b - c;
    const pa = Math.abs(p - a),
      pb = Math.abs(p - b),
      pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  }

  private escapePdf(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }
}
