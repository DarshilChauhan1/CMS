import { IsEmail, IsString } from "class-validator";

export class SignupDto {
    @IsString()
    name: string;

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;
}