import { ClientCreateDto } from './dto/client.create.dto';
import { Client } from './entity/client.entity';

export class ClientService {
  async create(data: ClientCreateDto, userId: number): Promise<Client> {
    const client = Client.create({
      ...data,
      nome: data.nome.trim(),
      logradouro: data.logradouro.trim(),
      numero: data.numero.trim(),
      complemento: data.complemento?.trim() || null,
      bairro: data.bairro.trim(),
      cidade: data.cidade.trim(),
      estado: data.estado.trim().toUpperCase(),
      userId,
    });
    await client.save();
    return client;
  }
}
