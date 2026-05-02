import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator {
  constructor(
        private readonly healthIndicatorService: HealthIndicatorService,
        private readonly prisma: PrismaService,
  ) { }

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      // Execute a simple query to verify database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
