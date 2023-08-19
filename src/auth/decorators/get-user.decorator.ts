import { User } from './../../users/entities/user.entity';
import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { UserRole } from 'src/users/enums/user-role.enum';

export const GetUser = createParamDecorator((roles: UserRole[] = [], context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  const user: User = req.user;

  if (!user) throw new InternalServerErrorException(`No user inside the request, make sure that we used th AuthGuard`);

  if (roles.length === 0) return user;

  if (roles.some((r) => user.roles.includes(r))) return user;

  throw new ForbiddenException(`User ${user.username} needs to have one of these roles: ${roles}`);
});
