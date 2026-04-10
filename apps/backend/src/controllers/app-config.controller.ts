import { Controller, Get, Put, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import prisma from '../clients/prisma';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ConfigProvider } from '../utils/configProvider';
import { AppConfigDto } from '../dtos/app-config.dto';
import { appConfigEntityToDto } from '../utils/entityToDtoMappers';
import { ErrorResponseDto, ModelSelectionIdsDto } from '../dtos/common.dto';

@ApiTags('app-config')
@Controller('api/app-config')
export class AppConfigController {
  @Get()
  @ApiOkResponse({ description: 'Get app configuration', type: AppConfigDto })
  async getAppConfig(
    @Res() res: Response<AppConfigDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const configProvider = await ConfigProvider.getInstance();
      const config = configProvider.getAppConfig();

      res.status(200).json(appConfigEntityToDto(config));
    } catch (error) {
      console.error('Get app config error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBody({ type: ModelSelectionIdsDto })
  @ApiOkResponse({ description: 'Update app configuration', type: AppConfigDto })
  async updateAppConfig(
    @Body() body: ModelSelectionIdsDto,
    @Req() req: Request,
    @Res() res: Response<AppConfigDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const {
        responseModelId,
        ttsModelId,
        realtimeModelId,
        realtimeTranscriptionModelId,
        timestampedTranscriptionModelId,
      } = body;

      const now = new Date();
      const configProvider = await ConfigProvider.getInstance();
      const currentConfig = configProvider.getAppConfig();

      const config = await prisma.$transaction(async (tx) => {
        await tx.appConfig.update({
          where: { id: currentConfig.id },
          data: { validTo: now },
        });

        const dataToCreate = {
          ...Object.fromEntries(
            Object.entries(currentConfig).filter(
              ([key]) => !['id', 'validFrom', 'validTo'].includes(key),
            ),
          ),
          userId: req.user!.userId,
          validFrom: now,
          validTo: null,
          responseModelId,
          ttsModelId,
          realtimeModelId,
          realtimeTranscriptionModelId,
          timestampedTranscriptionModelId,
        };

        return tx.appConfig.create({
          data: dataToCreate,
        });
      });

      await configProvider.refreshAppConfig();

      res.status(200).json(appConfigEntityToDto(config));
    } catch (error) {
      console.error('Update app config error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
