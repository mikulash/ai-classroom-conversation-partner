import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

interface Bucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    const key = this.getKey(request);
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return true;
    }

    bucket.count += 1;
    if (bucket.count > options.limit) {
      throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private getKey(request: Request): string {
    const forwardedFor = request.header('x-forwarded-for')?.split(',')[0]?.trim();
    const route = request.route as { path?: string } | undefined;
    const ip = forwardedFor ?? request.ip ?? request.socket.remoteAddress ?? 'unknown';
    return `${ip}:${request.method}:${route?.path ?? request.path}`;
  }
}
