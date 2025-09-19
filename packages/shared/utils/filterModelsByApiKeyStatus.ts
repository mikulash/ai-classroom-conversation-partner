import { AiProviderStatus } from '../types/apiKeyStatus.js';
import { API_KEY, ApiKey } from '../enums/ApiKey.js';
import { Enums } from '../types/supabase/database.types.js';
import type {
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from '../types/supabase/supabaseTypeHelpers.js';

export const realtimeProvidersApiKeys = {
  'OpenAi': API_KEY.OPENAI,
} as const satisfies Record<Enums<'providers_realtime_model'>, ApiKey>;

export const realtimeTranscriptionProvidersApiKeys = {
  'OpenAi': API_KEY.OPENAI,
} as const satisfies Record<Enums<'providers_realtime_transcription_model'>, ApiKey>;

export const responseProvidersApiKeys = {
  'Anthropic': API_KEY.CLAUDE,
  'xAi': API_KEY.GROK,
  'OpenAi': API_KEY.OPENAI,
} as const satisfies Record<Enums<'providers_response_model'>, ApiKey>;

export const timestampedTranscriptionProvidersApiKeys = {
  'OpenAi': API_KEY.OPENAI,
} as const satisfies Record<Enums<'providers_timestamped_transcription_model'>, ApiKey>;

export const ttsProvidersApiKeys = {
  'OpenAi': API_KEY.OPENAI,
  'ElevenLabs': API_KEY.ELEVENLABS,
} as const satisfies Record<Enums<'providers_tts_model'>, ApiKey>;


export type WithAvailability<T> = T & { isAvailable: boolean };

/**
 * Generic function to get models with availability status
 * @param availabilities - Array of provider availability statuses
 * @param modelOptions - Array of model options to check
 * @param providerEnvKeyMap - Map of provider names to API keys
 * @returns Array of models with an availability flag
 */
const getAvailableModels = <
    P extends string,
    T extends { provider: P }
>(
    availabilities: AiProviderStatus[],
    modelOptions: T[],
    providerEnvKeyMap: Record<P, ApiKey>,
  ): WithAvailability<T>[] => {
  return modelOptions.map((model) => {
    const requiredApiKey = providerEnvKeyMap[model.provider];
    const providerStatus = availabilities.find(
      (status) => status.apiKey === requiredApiKey,
    );
    return {
      ...model,
      isAvailable: providerStatus?.isAvailable === true,
    };
  });
};

export const getAvailableRealtimeTranscriptionModels = (availabilities: AiProviderStatus[], modelOptions: RealtimeTranscriptionModel[]): WithAvailability<RealtimeTranscriptionModel>[] => {
  return getAvailableModels(availabilities, modelOptions, realtimeTranscriptionProvidersApiKeys);
};

export const getAvailableResponseModels = (availabilities: AiProviderStatus[], modelOptions: ResponseModel[]): WithAvailability<ResponseModel>[] => {
  return getAvailableModels(availabilities, modelOptions, responseProvidersApiKeys);
};

export const getAvailableRealtimeModels = (availabilities: AiProviderStatus[], modelOptions: RealtimeModel[]): WithAvailability<RealtimeModel>[] => {
  return getAvailableModels(availabilities, modelOptions, realtimeProvidersApiKeys);
};

export const getAvailableTimestampedTranscriptionModels = (availabilities: AiProviderStatus[], modelOptions: TimestampedTranscriptionModel[]): WithAvailability<TimestampedTranscriptionModel>[] => {
  return getAvailableModels(availabilities, modelOptions, timestampedTranscriptionProvidersApiKeys);
};

export const getAvailableTtsModels = (availabilities: AiProviderStatus[], modelOptions: TtsModel[]): WithAvailability<TtsModel>[] => {
  return getAvailableModels(availabilities, modelOptions, ttsProvidersApiKeys);
};


