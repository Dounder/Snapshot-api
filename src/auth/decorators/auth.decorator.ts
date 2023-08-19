import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/users/enums/user-role.enum';
import { Roles } from './role.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, UserRoleGuard));
}
