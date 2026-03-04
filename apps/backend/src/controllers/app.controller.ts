import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Response } from 'express';
import prisma from '../clients/prisma';

export class AppHealthChecksDto {
    @ApiPropertyOptional({
      description: 'Returns "ok" string or error object if failed',
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      ],
    })
      database?: any;

    @ApiPropertyOptional()
      latencyMs?: number;
}

export class AppHealthResponseDto {
    @ApiProperty()
      status!: string;

    @ApiProperty()
      timestamp!: string;

    @ApiProperty({ type: AppHealthChecksDto })
      checks!: AppHealthChecksDto;
}


@ApiTags('root')
@Controller()
export class AppController {
    @Get()
    @ApiOkResponse({ description: 'Root check', type: String })
  root(@Res() res: Response): void {
    res.send('API is running - Refactored with Prisma & JWT Auth');
  }

    @Get('health')
    @ApiOkResponse({ description: 'Health status', type: AppHealthResponseDto })
    async health(@Res() res: Response<AppHealthResponseDto>): Promise<void> {
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
