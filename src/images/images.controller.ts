import { Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { Auth } from '../auth/decorators';
import { UserRole } from '../users/enums/user-role.enum';
import { fileFilter } from './helpers/file-filter.helper';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @Auth(UserRole.ADMIN, UserRole.USER)
  @UseInterceptors(FilesInterceptor('images', 20, { fileFilter: fileFilter }))
  create(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.imagesService.create(files);
  }

  @Get()
  findAll() {
    return this.imagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.imagesService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagesService.remove(+id);
  }
}
