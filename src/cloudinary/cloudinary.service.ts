import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse} from 'cloudinary'

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name : this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key : this.configService.get('CLOUDINARY_API_KEY'),
            api_secret : this.configService.get('CLOUDINARY_API_SECRET')
        })
    }

    async uploadImage(filePath : string) : Promise<UploadApiResponse | UploadApiErrorResponse>{
        return new Promise((resolve, reject)=>{
             cloudinary.uploader.upload(filePath, {folder : 'CMS'}, (error, result) => {
                 if(error) reject(error)
                 resolve(result)
             })
        })
    }
}
