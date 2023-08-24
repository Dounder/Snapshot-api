import { PaginationDto } from './../common/dto/pagination.dto';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { Auth } from '../auth/decorators';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateImageDto } from './dtos';
import { fileFilter } from './helpers/file-filter.helper';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @Auth(UserRole.ADMIN, UserRole.USER)
  @UseInterceptors(FilesInterceptor('images', 20, { fileFilter: fileFilter }))
  create(@UploadedFiles() files: Array<Express.Multer.File>, @Body() createImageDto: CreateImageDto) {
    return this.imagesService.create(files, createImageDto);
  }

  @Get()
  @Auth(UserRole.ADMIN, UserRole.USER)
  findAll(@Query() pagination: PaginationDto) {
    return this.imagesService.findAll(pagination);
  }

  @Get('public')
  findAllPublic() {
    return this.imagesService.findAllPublic();
  }

  @Get('user/:id')
  findAllByUser(@Param('id', ParseUUIDPipe) id: string, @Query() pagination: PaginationDto) {
    return this.imagesService.findAll(pagination, id);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.imagesService.remove(id);
  }
}
