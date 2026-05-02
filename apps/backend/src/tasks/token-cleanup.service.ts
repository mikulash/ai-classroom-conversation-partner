import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../core/prisma/prisma.service';
import { EnvConfigService } from '../core/config/env-config.service';

const tokenCleanupSchedule = process.env.TOKEN_CLEANUP_SCHEDULE ?? CronExpression.EVERY_DAY_AT_2AM;

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: EnvConfigService,
  ) {}

    /**
     * Cleanup expired and revoked refresh tokens
     * Runs daily at 2 AM by default
     */
    @Cron(tokenCleanupSchedule)
  async handleTokenCleanup(): Promise<void> {
    this.logger.log(`Running scheduled token cleanup (${this.config.tokenCleanupSchedule ?? CronExpression.EVERY_DAY_AT_2AM})...`);

    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Delete refresh tokens that are either expired for at least 1 day or revoked
      const refreshResult = await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: oneDayAgo } },
            { revoked: true },
          ],
        },
      });

      if (refreshResult.count > 0) {
        this.logger.log(`Successfully deleted ${refreshResult.count} refresh tokens`);
      } else {
        this.logger.debug('No expired/revoked tokens found');
      }
    } catch (error) {
      this.logger.error('Error during token cleanup:', error);
    }
  }
}
