import {
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from './supabase/supabaseTypeHelpers.js';
import { WithAvailability } from '../utils/filterModelsByApiKeyStatus.js';

export interface ModelOptions {
    responseModels: ResponseModel[];
    ttsModels: TtsModel[];
    realtimeModels: RealtimeModel[];
    timestampedTranscriptionModels: TimestampedTranscriptionModel[];
    realtimeTranscriptionModels: RealtimeTranscriptionModel[];
}

export type ModelOptionsWithAvailability = {
    [K in keyof ModelOptions]: ModelOptions[K] extends (infer T)[]
        ? WithAvailability<T>[]
        : ModelOptions[K]
};


export interface ModelSelection {
    responseModel: ResponseModel;
    ttsModel: TtsModel;
    realtimeModel: RealtimeModel;
    timestampedTranscriptionModel: TimestampedTranscriptionModel;
    realtimeTranscriptionModel: RealtimeTranscriptionModel;
}
