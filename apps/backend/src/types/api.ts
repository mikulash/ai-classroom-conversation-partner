import {
  TextToSpeechRequest,
  GetResponseParams,
  GetTimestampedTranscriptionParams,
  RealtimeTranscriptionRequest,
  RealtimeVoiceRequest,
  TextToSpeechTimestampedRequest,
} from '@repo/shared/types/apiClient';

type WithModelName<T, Extra extends object = object> = T & { model_api_name: string } & Extra;

export type GetTTSAudioParamsWithModelName =
    WithModelName<TextToSpeechRequest, { sample_rate: number }>;

export type GetResponseParamsWithModelName = WithModelName<GetResponseParams>;


export type GetTimestampedTranscriptionParamsWithModelName = WithModelName<GetTimestampedTranscriptionParams>;


export type GetRealtimeTranscriptionParamsWithModelName = WithModelName<RealtimeTranscriptionRequest>;


export type GetRealtimeVoiceParamsWithModelName = WithModelName<RealtimeVoiceRequest>;

export type GetTimestampedAudioParamsWithModelName = WithModelName<TextToSpeechTimestampedRequest, { sample_rate: number }>;
