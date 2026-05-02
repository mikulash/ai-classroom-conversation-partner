import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from '../guards/auth.guard';
import { JWTPayload } from '../../utils/auth';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JWTPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new UnauthorizedException('Authenticated user is missing from request');
    }
    return request.user;
  },
);
