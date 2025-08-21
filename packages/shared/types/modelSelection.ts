import {
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from './supabase/supabaseTypeHelpers.js';

export type ModelOptions = {
    responseModels: ResponseModel[];
    ttsModels: TtsModel[];
    realtimeModels: RealtimeModel[];
    timestampedTranscriptionModels: TimestampedTranscriptionModel[];
    realtimeTranscriptionModels: RealtimeTranscriptionModel[];
}

export interface ModelSelection {
    responseModel: ResponseModel;
    ttsModel: TtsModel;
    realtimeModel: RealtimeModel;
    timestampedTranscriptionModel: TimestampedTranscriptionModel;
    realtimeTranscriptionModel: RealtimeTranscriptionModel;
}
