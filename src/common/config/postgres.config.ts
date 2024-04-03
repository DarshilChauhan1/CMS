import { ConfigModule, ConfigService } from '@nestjs/config'
import {TypeOrmModuleAsyncOptions} from '@nestjs/typeorm'

export const PostgresAsyncConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('DB_HOST'),
      port: +configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_DATABASE'),
      autoLoadEntities : true,
      logging : true,
      synchronize: true,
    }),
    inject: [ConfigService],
}