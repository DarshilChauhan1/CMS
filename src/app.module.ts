import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresAsyncConfig } from './common/config/postgres.config';
import { ArticlesModule } from './articles/articles.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [AuthModule, UsersModule, CommonModule, ConfigModule.forRoot(), TypeOrmModule.forRootAsync(PostgresAsyncConfig), ArticlesModule, ReviewsModule, CloudinaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
