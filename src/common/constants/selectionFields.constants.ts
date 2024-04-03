import { User } from "src/users/entities/user.entity";
import { FindOptionsSelect } from "typeorm";

export const selectedFields : FindOptionsSelect<User> = {
    id : true,
    email : true,
    name : true,
    refreshToken : true,
    username : true
}