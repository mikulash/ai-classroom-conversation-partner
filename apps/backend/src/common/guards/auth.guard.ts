import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { extractTokenFromHeader, verifyAndDecodeToken } from '../../utils/auth';
import { JWTPayload } from '../../utils/auth';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    request.user = verifyAndDecodeToken(token);
    return true;
  }
}
