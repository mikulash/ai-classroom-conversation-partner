import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { AppConfigDto } from '../dtos/app-config.dto';
import { ModelSelectionIdsDto } from '../dtos/common.dto';
import { appConfigEntityToDto } from '../utils/entityToDtoMappers';
import { ConfigProvider } from '../utils/configProvider';
import { JWTPayload } from '../utils/auth';

@Injectable()
export class AppConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configProvider: ConfigProvider,
  ) {}

  async getAppConfig(): Promise<AppConfigDto> {
    const config = await this.configProvider.getAppConfig();
    return appConfigEntityToDto(config);
  }

  async updateAppConfig(body: ModelSelectionIdsDto, currentUser: JWTPayload): Promise<AppConfigDto> {
    await this.validateModelSelection(body);

    const now = new Date();
    const currentConfig = await this.configProvider.getAppConfig();

    const config = await this.prisma.$transaction(async (tx) => {
      await tx.appConfig.update({
        where: { id: currentConfig.id },
        data: { validTo: now },
      });

      return tx.appConfig.create({
        data: {
          userId: currentUser.userId,
          validFrom: now,
          validTo: null,
          responseModelId: body.responseModelId !== undefined ?
            body.responseModelId :
            currentConfig.responseModelId,
          ttsModelId: body.ttsModelId !== undefined ? body.ttsModelId : currentConfig.ttsModelId,
          realtimeModelId: body.realtimeModelId !== undefined ?
            body.realtimeModelId :
            currentConfig.realtimeModelId,
          realtimeTranscriptionModelId: body.realtimeTranscriptionModelId !== undefined ?
            body.realtimeTranscriptionModelId :
            currentConfig.realtimeTranscriptionModelId,
          timestampedTranscriptionModelId: body.timestampedTranscriptionModelId !== undefined ?
            body.timestampedTranscriptionModelId :
            currentConfig.timestampedTranscriptionModelId,
          silenceTimeoutInSeconds: currentConfig.silenceTimeoutInSeconds,
          allowedDomains: currentConfig.allowedDomains,
          appName: currentConfig.appName,
          maxConversationDurationInSeconds: currentConfig.maxConversationDurationInSeconds,
        },
      });
    });

    await this.configProvider.refreshAppConfig();
    return appConfigEntityToDto(config);
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
