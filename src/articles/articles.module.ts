import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Article } from './entities/article.entity';
import { MulterModule } from '@nestjs/platform-express';
import { MulterAsyncConfig } from 'src/common/config/multer.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports : [TypeOrmModule.forFeature([User, Article]), ConfigModule.forRoot(), MulterModule.registerAsync(MulterAsyncConfig), JwtModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, CloudinaryService],
})
export class ArticlesModule {}
