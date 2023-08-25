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
import { UserRole } from './enums/user-role.enum';

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

  async findAll(pagination: PaginationDto, user: User): Promise<User[]> {
    const { limit, offset } = pagination;

    const entityMetadata = this.usersRepository.metadata; // Get entity metadata to get all columns except password
    const validColumns = entityMetadata.columns.map((column) => column.propertyName).filter((column) => column !== 'password');

    const query = this.usersRepository
      .createQueryBuilder('user')
      .select(validColumns.map((column) => `user.${column}`))
      .skip(offset)
      .take(limit);

    if (user.roles.includes(UserRole.ADMIN)) query.withDeleted();

    if (!user.roles.includes(UserRole.ADMIN))
      query.andWhere('NOT user.roles && ARRAY[:excludedRole]::roles_enum[]', { excludedRole: UserRole.ADMIN });

    return await query.getMany();
  }

  async findOneBy(term: string, isAdmin = false): Promise<User> {
    try {
      const queryConditions = { where: isUUID(term) ? { id: term } : { email: term }, withDeleted: true };

      const user = await this.usersRepository.findOne(queryConditions);

      if (!user) throw new CustomError({ message: 'User not found', code: 404 });

      if (!isAdmin && user.deletedAt)
        throw new CustomError({ message: `User ${user.username} is inactive, please contact the administrator`, code: 403 });

      delete user.password;

      return user;
    } catch (error) {
      ExceptionHandler(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneBy(id);

    if (user.deletedAt) throw new CustomError({ message: `User ${user.username} is inactive, please contact the administrator`, code: 403 });

    try {
      await this.usersRepository.save({ ...user, ...updateUserDto });
    } catch (error) {
      ExceptionHandler(error);
    }

    return { ...user, ...updateUserDto };
  }

  async remove(currentUser: User, id: string): Promise<{ msg: string }> {
    if (currentUser.id === id) throw new UnauthorizedException('You cannot delete yourself');

    const user = await this.findOneBy(id, true);

    if (user.deletedAt) throw new BadRequestException(`User ${user.username} is already inactive`);

    try {
      await this.usersRepository.softRemove(user);
    } catch (error) {
      ExceptionHandler(error);
    }

    return { msg: `User ${user.username} deleted successfully` };
  }

  async restore(id: string): Promise<{ msg: string }> {
    const user = await this.findOneBy(id, true);

    if (!user.deletedAt) throw new BadRequestException(`User ${user.username} is not inactive`);

    try {
      await this.usersRepository.restore({ id: user.id });
    } catch (error) {
      ExceptionHandler(error);
    }

    return { msg: `User ${user.username} restored successfully` };
  }
}
