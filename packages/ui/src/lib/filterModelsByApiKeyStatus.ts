import { API_KEY, ApiKey } from '@repo/shared/enums/ApiKey';
import {
  RealtimeModelModel,
  RealtimeTranscriptionModelModel,
  ResponseModelModel,
  TimestampedTranscriptionModelModel,
  TtsModelModel,
} from '@repo/frontend-utils/src/models';
import {
  RealtimeModelProvider,
  ResponseModelProvider,
  TimestampedTranscriptionModelProvider,
  TranscriptionModelProvider,
  TtsModelProvider,
} from '@repo/frontend-utils/src/clients/generated';


export interface AiProviderStatus {
    apiKey: ApiKey;
    isAvailable: boolean;
}

export const realtimeProvidersApiKeys = {
  'OpenAi': API_KEY.OPENAI,
} as const satisfies Record<RealtimeModelProvider, ApiKey>;

export const realtimeTranscriptionProvidersApiKeys = {
  'OpenAi': API_KEY.OPENAI,
} as const satisfies Record<TranscriptionModelProvider, ApiKey>;

export const responseProvidersApiKeys = {
  'Anthropic': API_KEY.CLAUDE,
  'xAi': API_KEY.GROK,
  'OpenAi': API_KEY.OPENAI,
} as const satisfies Record<ResponseModelProvider, ApiKey>;

export const timestampedTranscriptionProvidersApiKeys = {
  'OpenAi': API_KEY.OPENAI,
} as const satisfies Record<TimestampedTranscriptionModelProvider, ApiKey>;

export const ttsProvidersApiKeys = {
  'OpenAi': API_KEY.OPENAI,
  'ElevenLabs': API_KEY.ELEVENLABS,
} as const satisfies Record<TtsModelProvider, ApiKey>;


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

export const getAvailableRealtimeTranscriptionModels = (availabilities: AiProviderStatus[], modelOptions: RealtimeTranscriptionModelModel[]): WithAvailability<RealtimeTranscriptionModelModel>[] => {
  return getAvailableModels(availabilities, modelOptions, realtimeTranscriptionProvidersApiKeys);
};

export const getAvailableResponseModels = (availabilities: AiProviderStatus[], modelOptions: ResponseModelModel[]): WithAvailability<ResponseModelModel>[] => {
  return getAvailableModels(availabilities, modelOptions, responseProvidersApiKeys);
};

export const getAvailableRealtimeModels = (availabilities: AiProviderStatus[], modelOptions: RealtimeModelModel[]): WithAvailability<RealtimeModelModel>[] => {
  return getAvailableModels(availabilities, modelOptions, realtimeProvidersApiKeys);
};

export const getAvailableTimestampedTranscriptionModels = (availabilities: AiProviderStatus[], modelOptions: TimestampedTranscriptionModelModel[]): WithAvailability<TimestampedTranscriptionModelModel>[] => {
  return getAvailableModels(availabilities, modelOptions, timestampedTranscriptionProvidersApiKeys);
};

export const getAvailableTtsModels = (availabilities: AiProviderStatus[], modelOptions: TtsModelModel[]): WithAvailability<TtsModelModel>[] => {
  return getAvailableModels(availabilities, modelOptions, ttsProvidersApiKeys);
};
