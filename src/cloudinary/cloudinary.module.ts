import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports : [ConfigModule.forRoot()],
  providers: [CloudinaryService],
  exports : [CloudinaryModule]
})
export class CloudinaryModule {}
