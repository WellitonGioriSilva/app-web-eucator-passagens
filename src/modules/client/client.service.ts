import { ClientCreateDto } from "./dto/client.create.dto";
import { Client } from "./entity/client.entity";

export class ClientService {
    async create(data: ClientCreateDto, userId: number): Promise<Client> {
        const client = Client.create({
            ...data,
            userId,
        });
        await client.save();
        return client;
    }
}