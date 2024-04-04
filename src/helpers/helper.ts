export class ResponseBody {
    statusCode: number;
    message: string;
    data: any;
    success : boolean;
    constructor(statusCode ?: number, message ?: string, data ?: any, success ?: boolean) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = success;
    }
}

export class UserIdExtracter {
    private request : Request;
    constructor(){}

    extractUser(){
        const userId = this.request['user'].id;
        return userId
    }

}