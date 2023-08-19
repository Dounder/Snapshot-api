import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from 'src/users/enums/user-role.enum';
import { META_ROLES_KEY } from '../decorators/role.decorator';
import { User } from './../../users/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles = this.reflector.get<UserRole[]>(META_ROLES_KEY, context.getHandler());

    if (!validRoles || validRoles.length === 0) return true;

    const user: User = context.switchToHttp().getRequest().user;

    if (!user) throw new InternalServerErrorException(`No user inside the request, make sure that we used the AuthGuard`);

    if (validRoles.some((r) => user.roles.includes(r))) return true;

    throw new ForbiddenException(`User ${user.username} need a valid role [${validRoles}]`);
  }
}
