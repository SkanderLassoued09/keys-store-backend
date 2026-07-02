import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth.constants';
import type { UserRole } from '../entities/user.entity';

// Global role guard. Runs after JwtAuthGuard (so req.user is set). Only enforces
// when a route/controller declares @Roles(...); otherwise any authenticated user
// passes. This is where server-side owner-only endpoints are enforced.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const user = context.switchToHttp().getRequest().user;
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException('Accès réservé.');
    }
    return true;
  }
}
