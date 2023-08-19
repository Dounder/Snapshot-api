import { UserRole } from './../../users/enums/user-role.enum';
import { SetMetadata } from '@nestjs/common';

export const META_ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(META_ROLES_KEY, roles);
