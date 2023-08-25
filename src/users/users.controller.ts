import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';

import { Auth, GetUser } from '../auth/decorators';
import { PaginationDto } from './../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Auth(UserRole.ADMIN, UserRole.USER)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Auth(UserRole.ADMIN, UserRole.USER)
  findAll(@Query() pagination: PaginationDto, @GetUser() user: User) {
    return this.usersService.findAll(pagination, user);
  }

  @Get(':term')
  @Auth(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('term') id: string, @GetUser() user: User) {
    return this.usersService.findOneBy(id, user.roles.includes(UserRole.ADMIN));
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN, UserRole.USER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/restore')
  @Auth(UserRole.ADMIN)
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.restore(id);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.usersService.remove(user, id);
  }
}
