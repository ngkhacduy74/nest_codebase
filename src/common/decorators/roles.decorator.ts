import { SetMetadata } from '@nestjs/common';
import { Role } from '@/modules/user/domain/enums/role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
