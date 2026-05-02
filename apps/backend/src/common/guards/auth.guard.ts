import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { extractTokenFromHeader } from '../../utils/auth';
import { JWTPayload } from '../../utils/auth';
import { TokenService } from '../../services/token.service';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      request.user = this.tokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}
