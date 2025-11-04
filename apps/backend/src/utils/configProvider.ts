import { API_KEY, ApiKey } from '@repo/shared/enums/ApiKey';
import { getUserCustomModelConfig } from './getUserCustomModelSelection';
import { fetchAppConfig, fetchModelOptions } from './databaseService';
import type { AppConfig, RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel } from '../generated/prisma/client';

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
  private app_config: AppConfig;
  private readonly model_options: ModelOptions;

  /**
     * Private constructor; use getInstance() instead.
     */
  private constructor(secrets: Secrets, app_config: AppConfig, model_options: ModelOptions) {
    this.secrets = secrets;
    this.app_config = app_config;
    this.model_options = model_options;
  }

  /**
     * Returns the singleton instance, initializing it on the first call.
     */
  public static async getInstance(): Promise<ConfigProvider> {
    if (!ConfigProvider.instance) {
      const secrets: Secrets = {
        [API_KEY.OPENAI]: process.env.OPENAI_API_KEY,
        [API_KEY.ELEVENLABS]: process.env.ELEVENLABS_API_KEY,
        [API_KEY.CLAUDE]: process.env.CLAUDE_API_KEY,
        [API_KEY.GROK]: process.env.GROK_API_KEY,
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
      responseModel: this.model_options.responseModels.find((model) => model.id === this.app_config.responseModelId)!,
      ttsModel: this.model_options.ttsModels.find((model) => model.id === this.app_config.ttsModelId)!,
      realtimeModel: this.model_options.realtimeModels.find((model) => model.id === this.app_config.realtimeModelId)!,
      timestampedTranscriptionModel: this.model_options.timestampedTranscriptionModels.find((model) => model.id === this.app_config.timestampedTranscriptionModelId)!,
      realtimeTranscriptionModel: this.model_options.realtimeTranscriptionModels.find((model) => model.id === this.app_config.realtimeTranscriptionModelId)!,
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
    return this.model_options.responseModels.find((model) => model.id === id);
  }

  public getTtsModelById(id: number): TtsModel | undefined {
    return this.model_options.ttsModels.find((model) => model.id === id);
  }

  public getRealtimeModelById(id: number): RealtimeModel | undefined {
    return this.model_options.realtimeModels.find((model) => model.id === id);
  }

  public getRealtimeTranscriptionModelById(id: number): RealtimeTranscriptionModel | undefined {
    return this.model_options.realtimeTranscriptionModels.find((model) => model.id === id);
  }

  public getTimestampedTranscriptionModelById(id: number): TimestampedTranscriptionModel | undefined {
    return this.model_options.timestampedTranscriptionModels.find((model) => model.id === id);
  }

  public getAppConfig(): AppConfig {
    return this.app_config;
  }
}


