import { AiProviderStatus } from '../types/apiKeyStatus.js';
import { API_KEY } from '../enums/ApiKey.js';
import { Enums } from '../types/supabase/database.types.js';
import type {
  RealtimeModel, RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel, TtsModel,
} from '../types/supabase/supabaseTypeHelpers.js';
import { ApiKey } from '../types/apiKey.js';

export const realtimeProvidersApiKeys= {
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

export const getAvailableRealtimeModels = (availabilities: AiProviderStatus[], modelOptions: RealtimeModel[]): RealtimeModel[] => {
  return modelOptions.filter((model) => {
    const requiredApiKey = realtimeProvidersApiKeys[model.provider];
    const providerStatus = availabilities.find(
      (status) => status.apiKey === requiredApiKey,
    );
    return providerStatus?.available === true;
  });
};


export const getAvailableRealtimeTranscriptionModels = (availabilities: AiProviderStatus[], modelOptions: RealtimeTranscriptionModel[]): RealtimeTranscriptionModel[] => {
  return modelOptions.filter((model) => {
    const requiredApiKey = realtimeTranscriptionProvidersApiKeys[model.provider];
    const providerStatus = availabilities.find(
      (status) => status.apiKey === requiredApiKey,
    );
    return providerStatus?.available === true;
  });
};

export const getAvailableResponseModels = (availabilities: AiProviderStatus[], modelOptions: ResponseModel[]): ResponseModel[] => {
  return modelOptions.filter((model) => {
    const requiredApiKey = responseProvidersApiKeys[model.provider];
    const providerStatus = availabilities.find(
      (status) => status.apiKey === requiredApiKey,
    );
    return providerStatus?.available === true;
  });
};

export const getAvailableTimestampedTranscriptionModels = (availabilities: AiProviderStatus[], modelOptions: TimestampedTranscriptionModel[]): TimestampedTranscriptionModel[] => {
  return modelOptions.filter((model) => {
    const requiredApiKey = timestampedTranscriptionProvidersApiKeys[model.provider];
    const providerStatus = availabilities.find(
      (status) => status.apiKey === requiredApiKey,
    );
    return providerStatus?.available === true;
  });
};

export const getAvailableTtsModels = (availabilities: AiProviderStatus[], modelOptions: TtsModel[]): TtsModel[] => {
  return modelOptions.filter((model) => {
    const requiredApiKey = ttsProvidersApiKeys[model.provider];
    const providerStatus = availabilities.find(
      (status) => status.apiKey === requiredApiKey,
    );
    return providerStatus?.available === true;
  });
};
