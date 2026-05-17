import { UserCreateDto } from "./dto/user.create.dto";
import { User } from "./entity/user.entity";
import * as bcrypt from 'bcrypt';

export class UserService {
    async create(data: UserCreateDto) {
        data.password = await bcrypt.hash(data.password, 10);
        const user = User.create(data);
        await user.save();
    }
}