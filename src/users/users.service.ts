import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';

import { CustomError } from '../common/helpers';
import { ExceptionHandler } from '../common/helpers/exception-handler.helper';
import { PaginationDto } from './../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.usersRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.usersRepository.save(user);

      delete user.password;

      return user;
    } catch (error) {
      ExceptionHandler(error);
    }
  }

  async findAll(pagination: PaginationDto): Promise<User[]> {
    const { limit, offset } = pagination;

    const entityMetadata = this.usersRepository.metadata; // Get entity metadata to get all columns except password
    const validColumns = entityMetadata.columns.map((column) => column.propertyName).filter((column) => column !== 'password');

    const query = this.usersRepository
      .createQueryBuilder('user')
      .select(validColumns.map((column) => `user.${column}`))
      .skip(offset)
      .take(limit)
      .withDeleted();

    return query.getMany();
  }

  async findOneBy(term: string): Promise<User> {
    try {
      const queryConditions = { where: isUUID(term) ? { id: term } : { email: term }, withDeleted: true };

      const user = await this.usersRepository.findOne(queryConditions);

      if (!user) throw new CustomError({ message: 'User not found', code: 404 });

      delete user.password;

      return user;
    } catch (error) {
      ExceptionHandler(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOneBy(id);

      if (user.deletedAt) throw new CustomError({ message: `User ${user.username} is inactive, please contact the administrator`, code: 403 });

      await this.usersRepository.save({ ...user, ...updateUserDto });

      return { ...user, ...updateUserDto };
    } catch (error) {
      ExceptionHandler(error);
    }
  }

  async remove(currentUser: User, id: string): Promise<{ msg: string }> {
    if (currentUser.id === id) throw new UnauthorizedException('You cannot delete yourself');

    const user = await this.findOneBy(id);

    if (user.deletedAt) throw new BadRequestException(`User ${user.username} is already inactive`);

    await this.usersRepository.softRemove(user);

    return { msg: `User ${user.username} deleted successfully` };
  }

  async restore(id: string): Promise<{ msg: string }> {
    const user = await this.findOneBy(id);

    if (!user.deletedAt) throw new BadRequestException(`User ${user.username} is not inactive`);

    await this.usersRepository.restore({ id: user.id });

    return { msg: `User ${user.username} restored successfully` };
  }
}
