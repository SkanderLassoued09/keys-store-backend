import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.constants';
import type { UserRole } from './entities/user.entity';

// Marks a route as reachable without authentication (e.g. login).
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Restricts a route/controller to the given role(s).
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Injects the decoded JWT payload (the current user) into a handler param.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user,
);
