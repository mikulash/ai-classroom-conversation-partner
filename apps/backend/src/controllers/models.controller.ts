import { Controller, Delete, Get, Param, Put, Body, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import prisma from '../clients/prisma';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ErrorResponse, MessageResponse } from '@repo/shared/types/dbRoutes.types';
import type {
  ResponseModelDto,
  TtsModelDto,
  RealtimeModelDto,
  RealtimeTranscriptionModelDto,
  TimestampedTranscriptionModelDto,
  CustomSelectionWithModelsDto,
} from '@repo/shared/types/db/dto';
import {
  responseModelToDto,
  ttsModelToDto,
  realtimeModelToDto,
  realtimeTranscriptionModelToDto,
  timestampedTranscriptionModelToDto,
  customSelectionWithModelsToDto,
} from '@repo/shared/mappers/dtoMappers';
import { UpdateCustomModelSelectionDto } from '../dtos/models.dto';

@ApiTags('models')
@Controller('api/models')
export class ModelsController {
    @Get('response')
    @ApiOkResponse({ description: 'List response models', type: Object })
  async getResponseModels(
        @Res() res: Response<ResponseModelDto[] | ErrorResponse>,
  ): Promise<void> {
    try {
      const models = await prisma.responseModel.findMany({
        where: { isEnabled: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(models.map(responseModelToDto));
    } catch (error) {
      console.error('Get response models error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

    @Get('tts')
    @ApiOkResponse({ description: 'List TTS models', type: Object })
    async getTtsModels(
        @Res() res: Response<TtsModelDto[] | ErrorResponse>,
    ): Promise<void> {
      try {
        const models = await prisma.ttsModel.findMany({
          where: { isEnabled: true },
          orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(models.map(ttsModelToDto));
      } catch (error) {
        console.error('Get TTS models error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    @Get('realtime')
    @ApiOkResponse({ description: 'List realtime models', type: Object })
    async getRealtimeModels(
        @Res() res: Response<RealtimeModelDto[] | ErrorResponse>,
    ): Promise<void> {
      try {
        const models = await prisma.realtimeModel.findMany({
          where: { isEnabled: true },
          orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(models.map(realtimeModelToDto));
      } catch (error) {
        console.error('Get realtime models error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    @Get('realtime-transcription')
    @ApiOkResponse({ description: 'List realtime transcription models', type: Object })
    async getRealtimeTranscriptionModels(
        @Res() res: Response<RealtimeTranscriptionModelDto[] | ErrorResponse>,
    ): Promise<void> {
      try {
        const models = await prisma.realtimeTranscriptionModel.findMany({
          where: { isEnabled: true },
          orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(models.map(realtimeTranscriptionModelToDto));
      } catch (error) {
        console.error('Get realtime transcription models error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    @Get('timestamped-transcription')
    @ApiOkResponse({ description: 'List timestamped transcription models', type: Object })
    async getTimestampedTranscriptionModels(
        @Res() res: Response<TimestampedTranscriptionModelDto[] | ErrorResponse>,
    ): Promise<void> {
      try {
        const models = await prisma.timestampedTranscriptionModel.findMany({
          where: { isEnabled: true },
          orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(models.map(timestampedTranscriptionModelToDto));
      } catch (error) {
        console.error('Get timestamped transcription models error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    @Get('custom-selection/:userId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'owner')
    @ApiParam({ name: 'userId', type: String })
    @ApiOkResponse({ description: 'Get custom model selection for user', type: Object })
    async getCustomSelection(
        @Param('userId') userId: string,
        @Res() res: Response<CustomSelectionWithModelsDto | null | ErrorResponse>,
    ): Promise<void> {
      try {
        const selection = await prisma.adminUserCustomModelSelection.findUnique({
          where: { userId },
          include: {
            responseModel: true,
            ttsModel: true,
            realtimeModel: true,
            realtimeTranscriptionModel: true,
            timestampedTranscriptionModel: true,
          },
        });

        res.status(200).json(selection ? customSelectionWithModelsToDto(selection) : null);
      } catch (error) {
        console.error('Get admin model selection error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    @Put('custom-selection/:userId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'owner')
    @ApiParam({ name: 'userId', type: String })
    @ApiBody({ type: UpdateCustomModelSelectionDto })
    @ApiOkResponse({ description: 'Update custom model selection for user', type: Object })
    async updateCustomSelection(
        @Param('userId') userId: string,
        @Body() body: UpdateCustomModelSelectionDto,
        @Res() res: Response<CustomSelectionWithModelsDto | ErrorResponse>,
    ): Promise<void> {
      try {
        const {
          responseModelId,
          ttsModelId,
          realtimeModelId,
          realtimeTranscriptionModelId,
          timestampedTranscriptionModelId,
        } = body;

        const user = await prisma.profile.findUnique({
          where: { id: userId },
        });

        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        const updateData: Partial<{
                responseModelId: number | null;
                ttsModelId: number | null;
                realtimeModelId: number | null;
                realtimeTranscriptionModelId: number | null;
                timestampedTranscriptionModelId: number | null;
            }> = {};

        if (responseModelId !== undefined) updateData.responseModelId = responseModelId;
        if (ttsModelId !== undefined) updateData.ttsModelId = ttsModelId;
        if (realtimeModelId !== undefined) updateData.realtimeModelId = realtimeModelId;
        if (realtimeTranscriptionModelId !== undefined) updateData.realtimeTranscriptionModelId = realtimeTranscriptionModelId;
        if (timestampedTranscriptionModelId !== undefined) updateData.timestampedTranscriptionModelId = timestampedTranscriptionModelId;

        const selection = await prisma.adminUserCustomModelSelection.upsert({
          where: { userId },
          create: {
            userId,
            ...updateData,
          },
          update: updateData,
          include: {
            responseModel: true,
            ttsModel: true,
            realtimeModel: true,
            realtimeTranscriptionModel: true,
            timestampedTranscriptionModel: true,
          },
        });

        res.status(200).json(customSelectionWithModelsToDto(selection));
      } catch (error) {
        console.error('Update admin model selection error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    @Delete('custom-selection/:userId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'owner')
    @ApiParam({ name: 'userId', type: String })
    @ApiOkResponse({ description: 'Delete custom model selection for user', type: Object })
    async deleteCustomSelection(
        @Param('userId') userId: string,
        @Res() res: Response<MessageResponse | ErrorResponse>,
    ): Promise<void> {
      try {
        await prisma.adminUserCustomModelSelection.delete({
          where: { userId },
        });

        res.status(200).json({ message: 'Admin model selection deleted successfully' });
      } catch (error) {
        console.error('Delete admin model selection error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
}
