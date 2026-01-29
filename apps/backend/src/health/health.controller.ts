import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiServiceUnavailableResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
        private health: HealthCheckService,
        private db: PrismaHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
  ) { }

    @Get()
    @HealthCheck()
    @ApiOkResponse({ description: 'Health check passed' })
    @ApiServiceUnavailableResponse({ description: 'Health check failed' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database health check
      () => this.db.isHealthy('database'),
      // Memory health check - ensure heap doesn't exceed 150MB
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // Disk health check - ensure at least 10% free space on system drive
      () => this.disk.checkStorage('storage', {
        path: process.platform === 'win32' ? 'C:\\' : '/',
        thresholdPercent: 0.1,
      }),
    ]);
  }

    @Get('liveness')
    @HealthCheck()
    @ApiOkResponse({ description: 'Application is alive' })
    @ApiServiceUnavailableResponse({ description: 'Application is not responding' })
    liveness(): Promise<HealthCheckResult> {
      // Simple liveness check - just returns OK if the app is running
      return this.health.check([]);
    }

    @Get('readiness')
    @HealthCheck()
    @ApiOkResponse({ description: 'Application is ready to receive traffic' })
    @ApiServiceUnavailableResponse({ description: 'Application is not ready' })
    readiness(): Promise<HealthCheckResult> {
      // Readiness check - verify database connectivity
      return this.health.check([
        () => this.db.isHealthy('database'),
      ]);
    }
}
