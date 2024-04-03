import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { RoleEnum } from "src/users/enums/user.enum";
import {CHECK_ROLES} from 'src/common/decorators/role.decorator'
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { selectedFields } from "src/common/constants/selectionFields.constants";

export class RoleGuard implements CanActivate {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private reflector : Reflector){}
    async canActivate(context: ExecutionContext):  Promise<boolean> {
        const getRoles : RoleEnum[] = this.reflector.get(CHECK_ROLES, context.getHandler());
        const request = context.switchToHttp().getRequest();
        let user = request.user;
        const getUserRole = await this.userRepository.findOne({where : {id : user.id}, select : selectedFields});
        const role = getRoles.find((role)=> role == getUserRole.role);
        //if the role in the user not found in the metadata we will return false
        if(role == undefined) return false;
        //if the role in the user found in the metadata we will return true
        return true;
    }
}
