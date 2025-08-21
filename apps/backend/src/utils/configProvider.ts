import { supabaseAdmin } from '../clients/supabase';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { ApiKey } from '@repo/shared/types/apiKey';
import {
  AppConfig,
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { getUserCustomModelConfig } from './getUserCustomModelSelection';
import { ModelOptions } from '@repo/shared/types/modelSelection';

/**
 * Singleton provider for accessing API keys stored in Supabase Vault.
 * Fetches all secrets once and caches them for the lifetime of the process.
 * App config is cached for 5 minutes and then refreshed.
 */
export class ConfigProvider {
  private static instance: ConfigProvider;
  private readonly secrets: Record<ApiKey, string | undefined>;
  private app_config: AppConfig;
  private readonly model_options: ModelOptions;
  private app_config_last_fetched: number;
  private static readonly APP_CONFIG_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  private static readonly KEEP_ALIVE_INTERVAL_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

  /**
   * Private constructor; use getInstance() instead.
   */
  private constructor(secrets: Record<ApiKey, string | undefined>, app_config: AppConfig, model_options: ModelOptions) {
    this.secrets = secrets;
    this.app_config = app_config;
    this.model_options = model_options;
    this.app_config_last_fetched = Date.now();

    // start a background timer that reloads app_config every 5 days
    this.startKeepAliveTimer();
  }

  /**
   * Returns the singleton instance, initializing it on the first call.
   */
  public static async getInstance(): Promise<ConfigProvider> {
    if (!ConfigProvider.instance) {
      const secrets: Record<ApiKey, string> = {
        [API_KEY.OPENAI]: process.env.OPENAI_API_KEY!,
        [API_KEY.ELEVENLABS]: process.env.ELEVENLABS_API_KEY!,
        [API_KEY.CLAUDE]: process.env.CLAUDE_API_KEY!,
        [API_KEY.GROK]: process.env.GROK_API_KEY!,
      };

      const complete_configuration = await ConfigProvider.loadCompleteConfig();

      ConfigProvider.instance = new ConfigProvider(secrets, complete_configuration.app_config, complete_configuration.model_options);
    } else {
      // Check if app_config cache has expired
      await ConfigProvider.instance.refreshAppConfigIfExpired();
    }

    return ConfigProvider.instance;
  }

  /**
   * Checks if app_config cache has expired and refreshes it if needed.
   */
  private async refreshAppConfigIfExpired(): Promise<void> {
    const now = Date.now();
    const timeSinceLastFetch = now - this.app_config_last_fetched;

    if (timeSinceLastFetch >= ConfigProvider.APP_CONFIG_CACHE_DURATION_MS) {
      console.log('Refreshing app_config from Supabase...');
      await this.refreshAppConfig();
    }
  }

  /**
   * Refreshes only the app_config from the database.
   */
  private async refreshAppConfig(): Promise<void> {
    const { data: app_config, error } = await supabaseAdmin
      .from('app_config')
      .select(`*`).single();

    if (error || !app_config) {
      throw new Error(`Supabase App Config refresh error: ${error.message}`);
    }

    this.app_config = app_config;
    this.app_config_last_fetched = Date.now();
  }

  /**
   * Every 5 days, call refreshAppConfig() to keep Supabase “active.”
   * This prevents a full 7-day idle window.
   */
  private startKeepAliveTimer(): void {
    setInterval(async () => {
      try {
        console.log('Keep-alive: reloading app_config from Supabase');
        await this.refreshAppConfig();
      } catch (err) {
        console.error('Keep-alive reload failed:', err);
      }
    }, ConfigProvider.KEEP_ALIVE_INTERVAL_MS);
  }

  private static async loadCompleteConfig(): Promise<{
    app_config: AppConfig;
    model_options: ModelOptions;
  }> {
    const { data: app_config, error } = await supabaseAdmin
      .from('app_config')
      .select(`*`).single();
    if (error || !app_config) {
      throw new Error(`Supabase App Config error: ${error.message}`);
    }

    const { data: responseModels, error: responseModelsError } = await supabaseAdmin
      .from('response_models')
      .select('*');
    const { data: ttsModels, error: ttsModelsError } = await supabaseAdmin
      .from('tts_models')
      .select('*');
    const { data: realtimeModels, error: realtimeModelsError } = await supabaseAdmin
      .from('realtime_models')
      .select('*');
    const { data: realtimeTranscriptionModels, error: realtimeTranscriptionModelsError } = await supabaseAdmin
      .from('realtime_transcription_models')
      .select('*');
    const { data: timestampedTranscriptionModels, error: timestampedTranscriptionModelsError } = await supabaseAdmin
      .from('timestamped_transcription_models')
      .select('*');

    if (responseModelsError || ttsModelsError || realtimeModelsError || realtimeTranscriptionModelsError || timestampedTranscriptionModelsError) {
      throw new Error(`Supabase Model Options error: ${responseModelsError?.message || ttsModelsError?.message || realtimeModelsError?.message} || ${timestampedTranscriptionModelsError?.message}`);
    }
    const model_options: ModelOptions = {
      responseModels: responseModels,
      ttsModels: ttsModels,
      realtimeModels: realtimeModels,
      timestampedTranscriptionModels: timestampedTranscriptionModels,
      realtimeTranscriptionModels: realtimeTranscriptionModels,
    };

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
      responseModel: this.model_options.responseModels.find((model) => model.id === this.app_config.response_model_id)!,
      ttsModel: this.model_options.ttsModels.find((model) => model.id === this.app_config.tts_model_id)!,
      realtimeModel: this.model_options.realtimeModels.find((model) => model.id === this.app_config.realtime_model_id)!,
      timestampedTranscriptionModel: this.model_options.timestampedTranscriptionModels.find((model) => model.id === this.app_config.timestamped_transcription_model_id)!,
      realtimeTranscriptionModel: this.model_options.realtimeTranscriptionModels.find((model) => model.id === this.app_config.realtime_transcription_model_id)!,
    };
  }

  public async getModelsForUser(userId: string) {
    const userCustomModelConfig = await getUserCustomModelConfig(userId);

    const responseModel = userCustomModelConfig?.response_model_id ?
      this.getResponseModelById(userCustomModelConfig.response_model_id) :
      this.getSelectedModels().responseModel;

    const ttsModel = userCustomModelConfig?.tts_model_id ?
      this.getTtsModelById(userCustomModelConfig.tts_model_id) :
      this.getSelectedModels().ttsModel;

    const realtimeModel = userCustomModelConfig?.realtime_model_id ?
      this.getRealtimeModelById(userCustomModelConfig.realtime_model_id) :
      this.getSelectedModels().realtimeModel;

    const timestampedTranscriptionModel = userCustomModelConfig?.timestamped_transcription_model_id ?
      this.getTimestampedTranscriptionModelById(userCustomModelConfig.timestamped_transcription_model_id) :
      this.getSelectedModels().timestampedTranscriptionModel;

    const realtimeTranscriptionModel = userCustomModelConfig?.realtime_transcription_model_id ?
      this.getRealtimeTranscriptionModelById(userCustomModelConfig.realtime_transcription_model_id) :
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
