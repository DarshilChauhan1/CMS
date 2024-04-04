import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleEnum } from "src/users/enums/user.enum";
import {CHECK_ROLES} from 'src/common/decorators/role.decorator'
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";

export class RoleGuard implements CanActivate {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private reflector : Reflector){}
    async canActivate(context: ExecutionContext):  Promise<boolean> {
        try {
            const getRoles : RoleEnum[] = this.reflector.get<RoleEnum[]>(CHECK_ROLES, context.getClass());
            
            const request = context.switchToHttp().getRequest();
            let user = request.user;
            const getUserRole = await this.userRepository.findOne({where : {id : user.id}, select : ['role']});

            const role = getRoles.some(userRole => getUserRole.role.includes(userRole));
            //if the role in the user not found in the metadata we will return false
            if(!role) return false;
            //if the role in the user found in the metadata we will return true
            return true;
        } catch (error) {
            throw error
        }
    }
}
