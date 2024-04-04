import { User } from "src/users/entities/user.entity";
import { FindOptionsSelect } from "typeorm";

export const selectedFields : (keyof User)[] = ['id', 'username', 'email', 'role']