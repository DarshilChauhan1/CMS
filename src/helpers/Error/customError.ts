import { HttpException } from "@nestjs/common";

export class CustomError extends HttpException{
    constructor(message ? : string, statusCode ? : number, redirectTo ? : string){
        super({message, redirectTo}, statusCode);
    }
}