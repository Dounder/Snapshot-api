import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './../users/entities/user.entity';
import { UsersService } from './../users/users.service';
import { USERS_DATA } from './data/users';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<string> {
    if (this.configService.get('state') === 'prod') throw new ForbiddenException('Seed is not allowed in production');

    await this.TruncateDatabase();

    const usersToCreate = USERS_DATA.map((user) => this.usersService.create(user));

    await Promise.all(usersToCreate);

    return 'Seed completed';
  }

  private async TruncateDatabase() {
    await this.usersRepository.delete({});
  }
}
