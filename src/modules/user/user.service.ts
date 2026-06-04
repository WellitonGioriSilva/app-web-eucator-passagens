import { UserCreateDto } from "./dto/user.create.dto";
import { User } from "./entity/user.entity";
import * as bcrypt from 'bcrypt';
import { NotFoundException } from "@nestjs/common";
import { Ticket } from "../ticket/entity/ticket.entity";

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
                id: "DESC",
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
            throw new NotFoundException("Passagem nao encontrada.");
        }

        const payment = ticket.sale?.payments?.[0];
        const lines = [
            "Eucator Passagens",
            `Passagem #${ticket.id}`,
            `Cliente: ${ticket.sale?.client.nome}`,
            `CPF: ${ticket.sale?.client.cpf}`,
            `Origem: ${ticket.trip.route.cidadeOrigem.nome} - ${ticket.trip.route.cidadeOrigem.uf}`,
            `Destino: ${ticket.trip.route.cidadeDestino.nome} - ${ticket.trip.route.cidadeDestino.uf}`,
            `Saida: ${this.formatDate(ticket.trip.dtHoraSaida)}`,
            `Poltrona: ${ticket.seat.numero}`,
            `Status: ${ticket.status}`,
            `Venda: #${ticket.sale?.id}`,
            `Pagamento: ${payment ? `#${payment.id} - ${payment.status}` : "Nao informado"}`,
        ];

        return this.createSimplePdf(lines);
    }

    private formatDate(value: Date): string {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(new Date(value));
    }

    private createSimplePdf(lines: string[]): Buffer {
        const text = lines
            .map((line, index) => `BT /F1 ${index === 0 ? 20 : 12} Tf 50 ${780 - index * 28} Td (${this.escapePdf(line)}) Tj ET`)
            .join("\n");
        const objects = [
            "<< /Type /Catalog /Pages 2 0 R >>",
            "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
            `<< /Length ${Buffer.byteLength(text, "latin1")} >>\nstream\n${text}\nendstream`,
        ];
        let pdf = "%PDF-1.4\n";
        const offsets = [0];

        objects.forEach((object, index) => {
            offsets.push(Buffer.byteLength(pdf, "latin1"));
            pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
        });

        const xrefOffset = Buffer.byteLength(pdf, "latin1");
        pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
        offsets.slice(1).forEach((offset) => {
            pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
        });
        pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

        return Buffer.from(pdf, "latin1");
    }

    private escapePdf(value: string): string {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\x20-\x7E]/g, "")
            .replace(/\\/g, "\\\\")
            .replace(/\(/g, "\\(")
            .replace(/\)/g, "\\)");
    }
}
