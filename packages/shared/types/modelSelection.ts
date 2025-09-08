import {
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from './supabase/supabaseTypeHelpers.js';
import { WithAvailability } from '../utils/filterModelsByApiKeyStatus.js';

export interface ModelOptions {
    responseModels: WithAvailability<ResponseModel>[];
    ttsModels: WithAvailability<TtsModel>[];
    realtimeModels: WithAvailability<RealtimeModel>[];
    timestampedTranscriptionModels: WithAvailability<TimestampedTranscriptionModel>[];
    realtimeTranscriptionModels: WithAvailability<RealtimeTranscriptionModel>[];
}

export interface ModelSelection {
    responseModel: ResponseModel;
    ttsModel: TtsModel;
    realtimeModel: RealtimeModel;
    timestampedTranscriptionModel: TimestampedTranscriptionModel;
    realtimeTranscriptionModel: RealtimeTranscriptionModel;
}
