import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Image } from './entities/image.entity';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { CloudinaryService } from './services/cloudinary.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, CloudinaryService],
  imports: [TypeOrmModule.forFeature([Image])],
  exports: [ImagesService, TypeOrmModule],
})
export class ImagesModule {}
