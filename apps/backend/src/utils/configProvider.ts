import { API_KEY, ApiKey } from '@repo/shared/enums/ApiKey';
import { getUserCustomModelConfig } from './getUserCustomModelSelection';
import { fetchAppConfig, fetchModelOptions } from './databaseService';
import type { AppConfig, RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel } from '../generated/prisma/client';
import { OPENAI_API_KEY, ELEVENLABS_API_KEY, CLAUDE_API_KEY, GROK_API_KEY } from '../constants/constants.js';

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

export class ConfigProvider {
  private static instance: ConfigProvider;
  private readonly secrets: Secrets;
  private readonly appConfig: AppConfig;
  private readonly modelOptions: ModelOptions;

  /**
     * Private constructor; use getInstance() instead.
     */
  private constructor(secrets: Secrets, app_config: AppConfig, model_options: ModelOptions) {
    this.secrets = secrets;
    this.appConfig = app_config;
    this.modelOptions = model_options;
  }

  /**
     * Returns the singleton instance, initializing it on the first call.
     */
  public static async getInstance(): Promise<ConfigProvider> {
    if (!ConfigProvider.instance) {
      const secrets: Secrets = {
        [API_KEY.OPENAI]: OPENAI_API_KEY,
        [API_KEY.ELEVENLABS]: ELEVENLABS_API_KEY,
        [API_KEY.CLAUDE]: CLAUDE_API_KEY,
        [API_KEY.GROK]: GROK_API_KEY,
      };

      const complete_configuration = await ConfigProvider.loadCompleteConfig();

      ConfigProvider.instance = new ConfigProvider(secrets, complete_configuration.app_config, complete_configuration.model_options);
    }

    return ConfigProvider.instance;
  }

  private static async loadCompleteConfig(): Promise<{
        app_config: AppConfig;
        model_options: ModelOptions;
    }> {
    const app_config = await fetchAppConfig();
    const model_options = await fetchModelOptions();

    return {
      app_config,
      model_options,
    };
  }


  public getApiKey(keyName: ApiKey): string {
    const key = this.secrets[keyName];
    if (!key) {
      throw new Error(`API key "${keyName}" not found in Vault secrets.`);
    }
    return key;
  }

  public getSelectedModels() {
    return {
      responseModel: this.modelOptions.responseModels.find((model) => model.id === this.appConfig.responseModelId)!,
      ttsModel: this.modelOptions.ttsModels.find((model) => model.id === this.appConfig.ttsModelId)!,
      realtimeModel: this.modelOptions.realtimeModels.find((model) => model.id === this.appConfig.realtimeModelId)!,
      timestampedTranscriptionModel: this.modelOptions.timestampedTranscriptionModels.find((model) => model.id === this.appConfig.timestampedTranscriptionModelId)!,
      realtimeTranscriptionModel: this.modelOptions.realtimeTranscriptionModels.find((model) => model.id === this.appConfig.realtimeTranscriptionModelId)!,
    };
  }

  public async getModelsForUser(userId: string) {
    const userCustomModelConfig = await getUserCustomModelConfig(userId);

    const responseModel = userCustomModelConfig?.responseModelId ?
      this.getResponseModelById(userCustomModelConfig.responseModelId) :
      this.getSelectedModels().responseModel;

    const ttsModel = userCustomModelConfig?.ttsModelId ?
      this.getTtsModelById(userCustomModelConfig.ttsModelId) :
      this.getSelectedModels().ttsModel;

    const realtimeModel = userCustomModelConfig?.realtimeModelId ?
      this.getRealtimeModelById(userCustomModelConfig.realtimeModelId) :
      this.getSelectedModels().realtimeModel;

    const timestampedTranscriptionModel = userCustomModelConfig?.timestampedTranscriptionModelId ?
      this.getTimestampedTranscriptionModelById(userCustomModelConfig.timestampedTranscriptionModelId) :
      this.getSelectedModels().timestampedTranscriptionModel;

    const realtimeTranscriptionModel = userCustomModelConfig?.realtimeTranscriptionModelId ?
      this.getRealtimeTranscriptionModelById(userCustomModelConfig.realtimeTranscriptionModelId) :
      this.getSelectedModels().realtimeTranscriptionModel;

    return {
      responseModel,
      ttsModel,
      realtimeModel,
      timestampedTranscriptionModel,
      realtimeTranscriptionModel,
    };
  }

  public getResponseModelById(id: number): ResponseModel | undefined {
    return this.modelOptions.responseModels.find((model) => model.id === id);
  }

  public getTtsModelById(id: number): TtsModel | undefined {
    return this.modelOptions.ttsModels.find((model) => model.id === id);
  }

  public getRealtimeModelById(id: number): RealtimeModel | undefined {
    return this.modelOptions.realtimeModels.find((model) => model.id === id);
  }

  public getRealtimeTranscriptionModelById(id: number): RealtimeTranscriptionModel | undefined {
    return this.modelOptions.realtimeTranscriptionModels.find((model) => model.id === id);
  }

  public getTimestampedTranscriptionModelById(id: number): TimestampedTranscriptionModel | undefined {
    return this.modelOptions.timestampedTranscriptionModels.find((model) => model.id === id);
  }

  public getAppConfig(): AppConfig {
    return this.appConfig;
  }
}


