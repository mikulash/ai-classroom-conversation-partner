import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import {
  CustomSelectionWithModelsDto,
  RealtimeModelDto,
  RealtimeTranscriptionModelDto,
  ResponseModelDto,
  TimestampedTranscriptionModelDto,
  TtsModelDto,
} from '../dtos/models.dto';
import { MessageResponseDto, ModelSelectionIdsDto } from '../dtos/common.dto';
import {
  customSelectionWithModelsToDto,
  realtimeModelEntityToDto,
  realtimeTranscriptionModelEntityToDto,
  responseModelEntityToDto,
  timestampedTranscriptionModelEntityToDto,
  ttsModelEntityToDto,
} from '../utils/entityToDtoMappers';
import { ConfigProvider } from '../utils/configProvider';

@Injectable()
export class ModelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configProvider: ConfigProvider,
  ) {}

  async getResponseModels(): Promise<ResponseModelDto[]> {
    const models = await this.prisma.responseModel.findMany({
      where: { isEnabled: true },
      orderBy: { createdAt: 'desc' },
    });
    return models.map(responseModelEntityToDto);
  }

  async getTtsModels(): Promise<TtsModelDto[]> {
    const models = await this.prisma.ttsModel.findMany({
      where: { isEnabled: true },
      orderBy: { createdAt: 'desc' },
    });
    return models.map(ttsModelEntityToDto);
  }

  async getRealtimeModels(): Promise<RealtimeModelDto[]> {
    const models = await this.prisma.realtimeModel.findMany({
      where: { isEnabled: true },
      orderBy: { createdAt: 'desc' },
    });
    return models.map(realtimeModelEntityToDto);
  }

  async getRealtimeTranscriptionModels(): Promise<RealtimeTranscriptionModelDto[]> {
    const models = await this.prisma.realtimeTranscriptionModel.findMany({
      where: { isEnabled: true },
      orderBy: { createdAt: 'desc' },
    });
    return models.map(realtimeTranscriptionModelEntityToDto);
  }

  async getTimestampedTranscriptionModels(): Promise<TimestampedTranscriptionModelDto[]> {
    const models = await this.prisma.timestampedTranscriptionModel.findMany({
      where: { isEnabled: true },
      orderBy: { createdAt: 'desc' },
    });
    return models.map(timestampedTranscriptionModelEntityToDto);
  }

  async getCustomSelection(userId: string): Promise<CustomSelectionWithModelsDto | null> {
    const selection = await this.prisma.adminUserCustomModelSelection.findUnique({
      where: { userId },
      include: {
        responseModel: true,
        ttsModel: true,
        realtimeModel: true,
        realtimeTranscriptionModel: true,
        timestampedTranscriptionModel: true,
      },
    });

    return selection ? customSelectionWithModelsToDto(selection) : null;
  }

  async updateCustomSelection(
    userId: string,
    body: ModelSelectionIdsDto,
  ): Promise<CustomSelectionWithModelsDto> {
    const user = await this.prisma.profile.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.validateModelSelection(body);

    const updateData: Partial<{
      responseModelId: number | null;
      ttsModelId: number | null;
      realtimeModelId: number | null;
      realtimeTranscriptionModelId: number | null;
      timestampedTranscriptionModelId: number | null;
    }> = {};

    if (body.responseModelId !== undefined) updateData.responseModelId = body.responseModelId;
    if (body.ttsModelId !== undefined) updateData.ttsModelId = body.ttsModelId;
    if (body.realtimeModelId !== undefined) updateData.realtimeModelId = body.realtimeModelId;
    if (body.realtimeTranscriptionModelId !== undefined) {
      updateData.realtimeTranscriptionModelId = body.realtimeTranscriptionModelId;
    }
    if (body.timestampedTranscriptionModelId !== undefined) {
      updateData.timestampedTranscriptionModelId = body.timestampedTranscriptionModelId;
    }

    const selection = await this.prisma.adminUserCustomModelSelection.upsert({
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

    this.configProvider.clearUserCustomModelConfig(userId);
    return customSelectionWithModelsToDto(selection);
  }

  async deleteCustomSelection(userId: string): Promise<MessageResponseDto> {
    const selection = await this.prisma.adminUserCustomModelSelection.findUnique({
      where: { userId },
    });

    if (!selection) {
      throw new NotFoundException('Admin model selection not found');
    }

    await this.prisma.adminUserCustomModelSelection.delete({ where: { userId } });
    this.configProvider.clearUserCustomModelConfig(userId);

    return { message: 'Admin model selection deleted successfully' };
  }

  private async validateModelSelection(body: ModelSelectionIdsDto): Promise<void> {
    await Promise.all([
      this.ensureResponseModelEnabled(body.responseModelId),
      this.ensureTtsModelEnabled(body.ttsModelId),
      this.ensureRealtimeModelEnabled(body.realtimeModelId),
      this.ensureRealtimeTranscriptionModelEnabled(body.realtimeTranscriptionModelId),
      this.ensureTimestampedTranscriptionModelEnabled(body.timestampedTranscriptionModelId),
    ]);
  }

  private async ensureResponseModelEnabled(id?: number | null): Promise<void> {
    if (id == null) return;
    const model = await this.prisma.responseModel.findFirst({ where: { id, isEnabled: true } });
    if (!model) throw new BadRequestException('Response model is not enabled or does not exist');
  }

  private async ensureTtsModelEnabled(id?: number | null): Promise<void> {
    if (id == null) return;
    const model = await this.prisma.ttsModel.findFirst({ where: { id, isEnabled: true } });
    if (!model) throw new BadRequestException('TTS model is not enabled or does not exist');
  }

  private async ensureRealtimeModelEnabled(id?: number | null): Promise<void> {
    if (id == null) return;
    const model = await this.prisma.realtimeModel.findFirst({ where: { id, isEnabled: true } });
    if (!model) throw new BadRequestException('Realtime model is not enabled or does not exist');
  }

  private async ensureRealtimeTranscriptionModelEnabled(id?: number | null): Promise<void> {
    if (id == null) return;
    const model = await this.prisma.realtimeTranscriptionModel.findFirst({ where: { id, isEnabled: true } });
    if (!model) throw new BadRequestException('Realtime transcription model is not enabled or does not exist');
  }

  private async ensureTimestampedTranscriptionModelEnabled(id?: number | null): Promise<void> {
    if (id == null) return;
    const model = await this.prisma.timestampedTranscriptionModel.findFirst({ where: { id, isEnabled: true } });
    if (!model) throw new BadRequestException('Timestamped transcription model is not enabled or does not exist');
  }
}
