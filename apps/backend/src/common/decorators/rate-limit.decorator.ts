import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export const RATE_LIMIT_KEY = 'rateLimit';

export const RateLimit = (options: RateLimitOptions): ReturnType<typeof SetMetadata> =>
  SetMetadata(RATE_LIMIT_KEY, options);
