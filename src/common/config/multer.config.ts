import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterModuleAsyncOptions } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage } from "multer";
import { extname } from "path";

export const MulterAsyncConfig : MulterModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      dest: configService.get<string>('MULTER_DEST'),
    }),
    inject: [ConfigService],
}

export let MulterCustomOptions : MulterOptions = {
    storage : diskStorage({
        destination : process.env.MULTER_DEST,
        filename : (req, file, cb) => {
            const uniqueSuffix = Date.now();
            const ext = extname(file.originalname);
            const filename = `${uniqueSuffix}${file.originalname}${ext}`;
            cb(null, filename);
        }
    })
}