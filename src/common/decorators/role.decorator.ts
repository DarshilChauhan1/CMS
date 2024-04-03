import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "src/users/enums/user.enum";

export const CHECK_ROLES = 'check-roles'

export const RoleDecorator = (...roles: RoleEnum[]) => SetMetadata(CHECK_ROLES, roles)