import { supabaseAdmin } from '../clients/supabase';
import { API_KEY, ApiKey } from '@repo/shared/enums/ApiKey';
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
import { RealtimeChannel } from '@supabase/supabase-js';
import { fetchAppConfig, fetchModelOptions } from './supabaseAdminService';

/**
 * Singleton provider for accessing API keys stored in Supabase Vault.
 * Fetches all secrets once and caches them for the lifetime of the process.
 * App config is automatically updated via real-time subscriptions.
 */

type Secrets = Record<ApiKey, string | undefined>;

export class ConfigProvider {
  private static instance: ConfigProvider;
  private static readonly KEEP_ALIVE_INTERVAL_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
  private readonly secrets: Secrets;
  private app_config: AppConfig;
  private readonly model_options: ModelOptions;
  private subscription: RealtimeChannel | null = null;

  /**
     * Private constructor; use getInstance() instead.
     */
  private constructor(secrets: Secrets, app_config: AppConfig, model_options: ModelOptions) {
    this.secrets = secrets;
    this.app_config = app_config;
    this.model_options = model_options;

    // Set up real-time subscription for app_config changes
    this.setupRealtimeSubscription();

    // Start a background timer that reloads app_config every 5 days
    this.startKeepAliveTimer();
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

  /**
     * Sets up real-time subscription to app_config table changes
     */
  private setupRealtimeSubscription(): void {
    this.subscription = supabaseAdmin
      .channel('app-config-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_config' },
        (payload) => {
          console.log('App config change received:', payload);
          if (payload.new && typeof payload.new === 'object') {
            this.app_config = payload.new as AppConfig;
            console.log('App config updated via real-time subscription');
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to app_config changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to app_config changes');
        } else if (status === 'TIMED_OUT') {
          console.warn('Subscription to app_config changes timed out');
        } else if (status === 'CLOSED') {
          console.log('Subscription to app_config changes closed');
        }
      });
  }

  /**
     * Cleanup method to unsubscribe from real-time changes
     */
  public cleanup(): void {
    if (this.subscription) {
      void supabaseAdmin.removeChannel(this.subscription);
      this.subscription = null;
      console.log('Unsubscribed from app_config changes');
    }
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

  /**
     * Refreshes the app_config from the database manually.
     * This is now only used by the keep-alive timer.
     */
  private async refreshAppConfig(): Promise<void> {
    this.app_config = await fetchAppConfig();
  }

  /**
     * Every 5 days, call refreshAppConfig() to keep Supabase "active."
     * This prevents a full 7-day idle window. Avoids stopping the supabase project on the free tier due to inactivity (like between semesters)
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
}
