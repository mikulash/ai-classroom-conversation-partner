import { Injectable } from '@nestjs/common';
import { API_KEY, ApiKey } from '@repo/shared/enums/ApiKey';
import { getUserCustomModelConfig } from './getUserCustomModelSelection';
import { fetchAppConfig, fetchModelOptions } from './databaseService';
import type {
  AppConfig,
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from '../generated/prisma/client';
import { CLAUDE_API_KEY, ELEVENLABS_API_KEY, GROK_API_KEY, OPENAI_API_KEY } from '../constants/constants';

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

  constructor() {
    this.secrets = {
      [API_KEY.OPENAI]: OPENAI_API_KEY,
      [API_KEY.ELEVENLABS]: ELEVENLABS_API_KEY,
      [API_KEY.CLAUDE]: CLAUDE_API_KEY,
      [API_KEY.GROK]: GROK_API_KEY,
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
    const appConfig = await fetchAppConfig();
    const modelOptions = await fetchModelOptions();

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
    this.appConfig = await fetchAppConfig();
  }


  public getApiKey(keyName: ApiKey): string {
    const key = this.secrets[keyName];
    if (!key) {
      throw new Error(`API key "${keyName}" not found in Vault secrets.`);
    }
    return key;
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
    const userCustomModelConfig = await getUserCustomModelConfig(userId);

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
}
