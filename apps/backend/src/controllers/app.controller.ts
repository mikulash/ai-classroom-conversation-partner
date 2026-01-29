import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import prisma from '../clients/prisma';

@ApiTags('root')
@Controller()
export class AppController {
  @Get()
  @ApiOkResponse({ description: 'Root check', type: Object })
  root(@Res() res: Response): void {
    res.send('API is running - Refactored with Prisma & JWT Auth');
  }

  @Get('health')
  @ApiOkResponse({ description: 'Health status', type: Object })
  async health(@Res() res: Response): Promise<void> {
    const timestamp = new Date().toISOString();
    const start = Date.now();

    try {
      await prisma.$connect();
      const latencyMs = Date.now() - start;

      console.log(`[Health] OK - database responsive in ${latencyMs}ms`);

      res.status(200).json({
        status: 'ok',
        timestamp,
        checks: {
          database: 'ok',
          latencyMs,
        },
      });
    } catch (error) {
      console.error('[Health] FAILED - database check error', error);

      res.status(503).json({
        status: 'error',
        timestamp,
        checks: {
          database: {
            status: 'error',
            message: 'Can\'t reach database server',
          },
        },
      });
    }
  }
}
