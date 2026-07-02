import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, JWT_SECRET } from '../auth.constants';
import { verifyJwt } from '../crypto.util';

// Global authentication guard. Every request must carry a valid Bearer token
// unless the route is explicitly @Public(). On success the decoded payload is
// attached as req.user for downstream guards/handlers.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const header: string = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    const payload = token ? verifyJwt(token, JWT_SECRET) : null;
    if (!payload) {
      throw new UnauthorizedException('Authentification requise.');
    }
    req.user = payload;
    return true;
  }
}
