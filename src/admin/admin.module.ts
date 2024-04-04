import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Article } from 'src/articles/entities/article.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports : [TypeOrmModule.forFeature([User, Article]), JwtModule, ConfigModule.forRoot()],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
