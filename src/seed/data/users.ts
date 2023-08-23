import { CreateUserDto } from './../../users/dto/create-user.dto';
import { UserRole } from './../../users/enums/user-role.enum';

export const USERS_DATA: CreateUserDto[] = [
  {
    username: 'glasdou',
    email: 'dr.glasdou@gmail.com',
    name: 'Douglas',
    lastName: 'Ramirez',
    password: 'Abcd@1234',
    roles: [UserRole.ADMIN, UserRole.USER, UserRole.GUEST],
  },
];
