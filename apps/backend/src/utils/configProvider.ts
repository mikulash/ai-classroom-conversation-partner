import { Injectable } from '@nestjs/common';
import { API_KEY, ApiKey } from '@repo/shared/enums/ApiKey';
import type {
  AdminUserCustomModelSelection,
  AppConfig,
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from '../generated/prisma/client';
import { PrismaService } from '../core/prisma/prisma.service';
import { EnvConfigService } from '../core/config/env-config.service';

/**
 * Fetches all secrets once and caches them for the lifetime of the process.
 */

type Secrets = Record<ApiKey, string | undefined>;

export interface ModelOptions {
    responseModels: ResponseModel[];
    ttsModels: TtsModel[];
    realtimeModels: RealtimeModel[];
    timestampedTranscriptionModels: TimestampedTranscriptionModel[];
    realtimeTranscriptionModels: RealtimeTranscriptionModel[];
}

@Injectable()
export class ConfigProvider {
  private readonly secrets: Secrets;
  private appConfig?: AppConfig;
  private modelOptions?: ModelOptions;
  private loadPromise?: Promise<void>;
  private readonly nullConfigCache = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    config: EnvConfigService,
  ) {
    this.secrets = {
      [API_KEY.OPENAI]: config.openAiApiKey,
      [API_KEY.ELEVENLABS]: config.elevenLabsApiKey,
      [API_KEY.CLAUDE]: config.claudeApiKey,
      [API_KEY.GROK]: config.grokApiKey,
    };
  }

  private async ensureLoaded(): Promise<void> {
    if (this.appConfig && this.modelOptions) {
      return;
    }

    this.loadPromise ??= this.loadCompleteConfig()
      .then(({ appConfig, modelOptions }) => {
        this.appConfig = appConfig;
        this.modelOptions = modelOptions;
      })
      .catch((error: unknown) => {
        this.loadPromise = undefined;
        throw error;
      });

    await this.loadPromise;
  }

  private async getLoadedState(): Promise<{
        appConfig: AppConfig;
        modelOptions: ModelOptions;
    }> {
    await this.ensureLoaded();

    if (!this.appConfig || !this.modelOptions) {
      throw new Error('Configuration failed to load.');
    }

    return {
      appConfig: this.appConfig,
      modelOptions: this.modelOptions,
    };
  }

  private async loadCompleteConfig(): Promise<{
        appConfig: AppConfig;
        modelOptions: ModelOptions;
    }> {
    const appConfig = await this.fetchAppConfig();
    const modelOptions = await this.fetchModelOptions();

    return {
      appConfig,
      modelOptions,
    };
  }

  /**
   * Refreshes the cached app config from the database.
   * Call this after updating the app config to invalidate the cache.
   */
  public async refreshAppConfig(): Promise<void> {
    await this.ensureLoaded();
    this.appConfig = await this.fetchAppConfig();
  }

  public async refreshModelOptions(): Promise<void> {
    await this.ensureLoaded();
    this.modelOptions = await this.fetchModelOptions();
  }

  public clearUserCustomModelConfig(userId: string): void {
    this.nullConfigCache.delete(userId);
  }


  public getApiKey(keyName: ApiKey): string {
    const key = this.secrets[keyName];
    if (!key) {
      throw new Error(`API key "${keyName}" not found in Vault secrets.`);
    }
    return key;
  }

  public isApiKeyAvailable(keyName: ApiKey): boolean {
    return Boolean(this.secrets[keyName]);
  }

  public async getSelectedModels() {
    const { appConfig, modelOptions } = await this.getLoadedState();

    return {
      responseModel: modelOptions.responseModels.find((model) => model.id === appConfig.responseModelId),
      ttsModel: modelOptions.ttsModels.find((model) => model.id === appConfig.ttsModelId),
      realtimeModel: modelOptions.realtimeModels.find((model) => model.id === appConfig.realtimeModelId),
      timestampedTranscriptionModel: modelOptions.timestampedTranscriptionModels.find((model) => model.id === appConfig.timestampedTranscriptionModelId),
      realtimeTranscriptionModel: modelOptions.realtimeTranscriptionModels.find((model) => model.id === appConfig.realtimeTranscriptionModelId),
    };
  }

  public async getModelsForUser(userId: string) {
    const [selectedModels, { modelOptions }] = await Promise.all([
      this.getSelectedModels(),
      this.getLoadedState(),
    ]);
    const userCustomModelConfig = await this.getUserCustomModelConfig(userId);

    const responseModel = userCustomModelConfig?.responseModelId ?
      modelOptions.responseModels.find((model) => model.id === userCustomModelConfig.responseModelId) :
      selectedModels.responseModel;

    const ttsModel = userCustomModelConfig?.ttsModelId ?
      modelOptions.ttsModels.find((model) => model.id === userCustomModelConfig.ttsModelId) :
      selectedModels.ttsModel;

    const realtimeModel = userCustomModelConfig?.realtimeModelId ?
      modelOptions.realtimeModels.find((model) => model.id === userCustomModelConfig.realtimeModelId) :
      selectedModels.realtimeModel;

    const timestampedTranscriptionModel = userCustomModelConfig?.timestampedTranscriptionModelId ?
      modelOptions.timestampedTranscriptionModels.find((model) => model.id === userCustomModelConfig.timestampedTranscriptionModelId) :
      selectedModels.timestampedTranscriptionModel;

    const realtimeTranscriptionModel = userCustomModelConfig?.realtimeTranscriptionModelId ?
      modelOptions.realtimeTranscriptionModels.find((model) => model.id === userCustomModelConfig.realtimeTranscriptionModelId) :
      selectedModels.realtimeTranscriptionModel;

    return {
      responseModel,
      ttsModel,
      realtimeModel,
      timestampedTranscriptionModel,
      realtimeTranscriptionModel,
    };
  }

  public async getResponseModelById(id: number): Promise<ResponseModel | undefined> {
    const { modelOptions } = await this.getLoadedState();
    return modelOptions.responseModels.find((model) => model.id === id);
  }

  public async getTtsModelById(id: number): Promise<TtsModel | undefined> {
    const { modelOptions } = await this.getLoadedState();
    return modelOptions.ttsModels.find((model) => model.id === id);
  }

  public async getRealtimeModelById(id: number): Promise<RealtimeModel | undefined> {
    const { modelOptions } = await this.getLoadedState();
    return modelOptions.realtimeModels.find((model) => model.id === id);
  }

  public async getRealtimeTranscriptionModelById(id: number): Promise<RealtimeTranscriptionModel | undefined> {
    const { modelOptions } = await this.getLoadedState();
    return modelOptions.realtimeTranscriptionModels.find((model) => model.id === id);
  }

  public async getTimestampedTranscriptionModelById(id: number): Promise<TimestampedTranscriptionModel | undefined> {
    const { modelOptions } = await this.getLoadedState();
    return modelOptions.timestampedTranscriptionModels.find((model) => model.id === id);
  }

  /**
   * Returns the cached app config.
   */
  public async getAppConfig(): Promise<AppConfig> {
    const { appConfig } = await this.getLoadedState();
    return appConfig;
  }

  private async fetchAppConfig(asOfDate: Date = new Date()): Promise<AppConfig> {
    const appConfig = await this.prisma.appConfig.findFirst({
      where: {
        validFrom: { lte: asOfDate },
        OR: [
          { validTo: null },
          { validTo: { gt: asOfDate } },
        ],
      },
      orderBy: { validFrom: 'desc' },
    });

    if (!appConfig) {
      throw new Error('App Config not found');
    }

    return appConfig;
  }

  private async fetchModelOptions(): Promise<ModelOptions> {
    const [
      responseModels,
      ttsModels,
      realtimeModels,
      timestampedTranscriptionModels,
      realtimeTranscriptionModels,
    ] = await Promise.all([
      this.prisma.responseModel.findMany(),
      this.prisma.ttsModel.findMany(),
      this.prisma.realtimeModel.findMany(),
      this.prisma.timestampedTranscriptionModel.findMany(),
      this.prisma.realtimeTranscriptionModel.findMany(),
    ]);

    return {
      responseModels,
      ttsModels,
      realtimeModels,
      timestampedTranscriptionModels,
      realtimeTranscriptionModels,
    };
  }

  private async getUserCustomModelConfig(userId: string): Promise<AdminUserCustomModelSelection | null> {
    const cachedExpiry = this.nullConfigCache.get(userId);
    if (cachedExpiry && cachedExpiry > Date.now()) {
      return null;
    }
    if (cachedExpiry) {
      this.nullConfigCache.delete(userId);
    }

    const data = await this.prisma.adminUserCustomModelSelection.findUnique({
      where: { userId },
    });

    if (!data) {
      this.nullConfigCache.set(userId, Date.now() + 10 * 60 * 1000);
      return null;
    }

    return data;
  }
}
